import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../config/database';
import { Image, ImageStatus } from '../entities/Image';
import { AuditLog, AuditAction } from '../entities/AuditLog';
import { uploadToR2, getPresignedUrl } from './r2.service';
import { checkAndIncrementUpload, checkAndIncrementDownload } from './usageCounter.service';
import { HttpError } from '../utils/httpError';

export interface UploadImageInput {
  buffer: Buffer;
  mimeType: string;
  sizeBytes: number;
  title?: string;
  location?: string;
  tags?: string[];
}

type UploadSource = 'web' | 'api';

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mime] ?? 'bin';
}

export async function uploadImage(
  userId: string,
  input: UploadImageInput,
  source: UploadSource,
): Promise<Image> {
  // Check + increment rate limit before uploading to R2
  await checkAndIncrementUpload(userId, source);

  const ext = mimeToExt(input.mimeType);
  const storageKey = `images/${userId}/${uuidv4()}.${ext}`;

  await uploadToR2(storageKey, input.buffer, input.mimeType);

  const imageRepo = AppDataSource.getRepository(Image);
  const image = imageRepo.create({
    uploaderUserId: userId,
    status: ImageStatus.PENDING,
    title: input.title ?? null,
    location: input.location ?? null,
    tags: input.tags ?? [],
    storageKey,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
  });

  await imageRepo.save(image);

  const auditRepo = AppDataSource.getRepository(AuditLog);
  await auditRepo.save(
    auditRepo.create({ userId, action: AuditAction.UPLOAD, imageId: image.id }),
  );

  return image;
}

export interface ListImagesQuery {
  q?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export async function getApprovedImages(
  query: ListImagesQuery,
): Promise<{ images: Image[]; total: number; page: number; limit: number }> {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));

  const imageRepo = AppDataSource.getRepository(Image);
  const qb = imageRepo
    .createQueryBuilder('image')
    .leftJoinAndSelect('image.uploader', 'uploader')
    .where('image.status = :status', { status: ImageStatus.APPROVED })
    .orderBy('image.createdAt', 'DESC');

  if (query.q) {
    qb.andWhere('image.title ILIKE :q', { q: `%${query.q}%` });
  }

  if (query.tags && query.tags.length > 0) {
    // PostgreSQL array containment: image must have ALL requested tags
    qb.andWhere('image.tags @> :tags', { tags: query.tags });
  }

  const [images, total] = await qb
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return { images, total, page, limit };
}

export async function getApprovedImageById(id: string): Promise<Image> {
  const imageRepo = AppDataSource.getRepository(Image);
  const image = await imageRepo.findOne({
    where: { id, status: ImageStatus.APPROVED },
    relations: ['uploader'],
  });

  if (!image) throw new HttpError(404, 'Image not found');
  return image;
}

export async function getDownloadUrl(
  imageId: string,
  userId: string | undefined,
  source: UploadSource,
): Promise<string> {
  const image = await getApprovedImageById(imageId);

  if (userId) {
    await checkAndIncrementDownload(userId, source);

    const auditRepo = AppDataSource.getRepository(AuditLog);
    await auditRepo.save(
      auditRepo.create({ userId, action: AuditAction.DOWNLOAD, imageId: image.id }),
    );
  }

  return getPresignedUrl(image.storageKey, 600);
}

export async function getMyImages(userId: string): Promise<Image[]> {
  const imageRepo = AppDataSource.getRepository(Image);
  return imageRepo.find({
    where: { uploaderUserId: userId },
    order: { createdAt: 'DESC' },
  });
}

export async function getTopTags(limit = 5): Promise<Array<{ tag: string; count: number }>> {
  const imageRepo = AppDataSource.getRepository(Image);
  const rows: Array<{ tag: string; count: string }> = await imageRepo.query(
    `SELECT unnest(tags) AS tag, COUNT(*) AS count
     FROM images
     WHERE status = $1
     GROUP BY tag
     ORDER BY count DESC
     LIMIT $2`,
    [ImageStatus.APPROVED, limit],
  );

  return rows.map((r) => ({ tag: r.tag, count: parseInt(r.count, 10) }));
}
