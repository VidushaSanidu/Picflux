import { AppDataSource } from '../config/database';
import { Image, ImageStatus } from '../entities/Image';
import { AuditLog, AuditAction } from '../entities/AuditLog';
import { getPresignedUrl, deleteFromR2 } from './r2.service';
import { HttpError } from '../utils/httpError';

export async function getPendingImages(): Promise<Image[]> {
  const imageRepo = AppDataSource.getRepository(Image);
  return imageRepo.find({
    where: { status: ImageStatus.PENDING },
    relations: ['uploader'],
    order: { createdAt: 'ASC' },
  });
}

export async function getPendingImageById(id: string): Promise<Image & { previewUrl: string }> {
  const imageRepo = AppDataSource.getRepository(Image);
  const image = await imageRepo.findOne({
    where: { id, status: ImageStatus.PENDING },
    relations: ['uploader'],
  });

  if (!image) throw new HttpError(404, 'Pending image not found');

  const previewUrl = await getPresignedUrl(image.storageKey, 600);
  return { ...image, previewUrl };
}

export async function approveImage(imageId: string, adminId: string): Promise<Image> {
  const imageRepo = AppDataSource.getRepository(Image);
  const image = await imageRepo.findOne({ where: { id: imageId } });

  if (!image) throw new HttpError(404, 'Image not found');
  if (image.status !== ImageStatus.PENDING) {
    throw new HttpError(409, `Image is already ${image.status}`);
  }

  image.status = ImageStatus.APPROVED;
  image.approvedById = adminId;
  image.approvedAt = new Date();
  image.rejectionReason = null;

  await imageRepo.save(image);

  const auditRepo = AppDataSource.getRepository(AuditLog);
  await auditRepo.save(
    auditRepo.create({ userId: adminId, action: AuditAction.APPROVE, imageId }),
  );

  return image;
}

export async function rejectImage(
  imageId: string,
  adminId: string,
  reason?: string,
): Promise<Image> {
  const imageRepo = AppDataSource.getRepository(Image);
  const image = await imageRepo.findOne({ where: { id: imageId } });

  if (!image) throw new HttpError(404, 'Image not found');
  if (image.status !== ImageStatus.PENDING) {
    throw new HttpError(409, `Image is already ${image.status}`);
  }

  image.status = ImageStatus.REJECTED;
  image.rejectionReason = reason ?? null;

  await imageRepo.save(image);

  const auditRepo = AppDataSource.getRepository(AuditLog);
  await auditRepo.save(
    auditRepo.create({
      userId: adminId,
      action: AuditAction.REJECT,
      imageId,
      metadata: reason ? { reason } : null,
    }),
  );

  return image;
}

export async function setImageFeatured(
  imageId: string,
  adminId: string,
  featured: boolean,
): Promise<Image> {
  const imageRepo = AppDataSource.getRepository(Image);
  const image = await imageRepo.findOne({ where: { id: imageId } });

  if (!image) throw new HttpError(404, 'Image not found');
  if (image.status !== ImageStatus.APPROVED) {
    throw new HttpError(409, 'Only approved images can be featured');
  }

  image.featured = featured;
  await imageRepo.save(image);

  const auditRepo = AppDataSource.getRepository(AuditLog);
  await auditRepo.save(
    auditRepo.create({
      userId: adminId,
      action: AuditAction.SET_FEATURED,
      imageId,
      metadata: { featured },
    }),
  );

  return image;
}

export async function deleteImage(imageId: string, adminId: string): Promise<void> {
  const imageRepo = AppDataSource.getRepository(Image);
  const image = await imageRepo.findOne({ where: { id: imageId } });

  if (!image) throw new HttpError(404, 'Image not found');

  await deleteFromR2(image.storageKey);
  await imageRepo.remove(image);

  const auditRepo = AppDataSource.getRepository(AuditLog);
  await auditRepo.save(
    auditRepo.create({ userId: adminId, action: AuditAction.DELETE, imageId }),
  );
}
