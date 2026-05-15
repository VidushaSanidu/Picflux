import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../config/database';
import { Job } from '../entities/Job';
import { uploadToR2, getPresignedUrl } from './r2.service';
import { HttpError } from '../utils/httpError';

const jobRepo = () => AppDataSource.getRepository(Job);

export interface UpdateJobInput {
  processedImageBuffer?: Buffer;
  processedImageMimeType?: string;
  initialModelScore?: number;
  initialClass?: string;
  afterClass?: string;
  afterScore?: number;
}

/** Upload user image to R2 and create a new Job record. */
export async function createJob(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<Job> {
  const ext = mimeType.split('/')[1] ?? 'bin';
  const userImageKey = `prb/user/${uuidv4()}.${ext}`;

  await uploadToR2(userImageKey, imageBuffer, mimeType);

  const job = jobRepo().create({ userImageKey });
  return jobRepo().save(job);
}

/** Return all jobs with presigned URLs for stored images. */
export async function getAllJobs(): Promise<object[]> {
  const jobs = await jobRepo().find({ order: { createdAt: 'DESC' } });

  return Promise.all(
    jobs.map(async (job) => ({
      id: job.id,
      userImageUrl: await getPresignedUrl(job.userImageKey),
      userImageKey: job.userImageKey,
      processedImageUrl: job.processedImageKey
        ? await getPresignedUrl(job.processedImageKey)
        : null,
      processedImageKey: job.processedImageKey,
      initialModelScore: job.initialModelScore,
      initialClass: job.initialClass,
      afterClass: job.afterClass,
      afterScore: job.afterScore,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })),
  );
}

/** Update a job with result data. Optionally uploads a processed image to R2. */
export async function updateJob(
  id: string,
  input: UpdateJobInput,
): Promise<Job> {
  const job = await jobRepo().findOneBy({ id });

  if (!job) {
    throw new HttpError(404, `Job not found: ${id}`);
  }

  if (input.processedImageBuffer && input.processedImageMimeType) {
    const ext = input.processedImageMimeType.split('/')[1] ?? 'bin';
    const processedImageKey = `prb/processed/${uuidv4()}.${ext}`;
    await uploadToR2(processedImageKey, input.processedImageBuffer, input.processedImageMimeType);
    job.processedImageKey = processedImageKey;
  }

  if (input.initialModelScore !== undefined) job.initialModelScore = input.initialModelScore;
  if (input.initialClass !== undefined) job.initialClass = input.initialClass;
  if (input.afterClass !== undefined) job.afterClass = input.afterClass;
  if (input.afterScore !== undefined) job.afterScore = input.afterScore;

  return jobRepo().save(job);
}
