import { v4 as uuidv4 } from 'uuid';
import { MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Job, JobStatus } from '../entities/Job';
import { PrbUserRole } from '../entities/User';
import { uploadToR2, getPresignedUrl } from './r2.service';
import { HttpError } from '../utils/httpError';

const DAILY_JOB_LIMIT = parseInt(process.env.DAILY_JOB_LIMIT ?? '10', 10);

const jobRepo = () => AppDataSource.getRepository(Job);

export interface UpdateJobInput {
  processedImageBuffer?: Buffer;
  processedImageMimeType?: string;
  initialModelScore?: number;
  initialClass?: string;
  afterClass?: string;
  afterScore?: number;
  status?: JobStatus;
  exampleImageBuffers?: Buffer[];
  exampleImageMimeTypes?: string[];
  perturbedExampleImageBuffers?: Buffer[];
  perturbedExampleImageMimeTypes?: string[];
}

export interface DailyLimitInfo {
  limit: number | null;
  used: number;
  remaining: number | null;
  resetsAt: string;
}

/** Return the daily job usage for a user. Admins have no limit. */
export async function getDailyLimitInfo(userId: string, userRole: PrbUserRole): Promise<DailyLimitInfo> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const startOfNextDay = new Date(startOfDay);
  startOfNextDay.setUTCDate(startOfNextDay.getUTCDate() + 1);

  const used = await jobRepo().count({
    where: { userId, createdAt: MoreThanOrEqual(startOfDay) },
  });

  if (userRole === PrbUserRole.ADMIN) {
    return { limit: null, used, remaining: null, resetsAt: startOfNextDay.toISOString() };
  }

  return {
    limit: DAILY_JOB_LIMIT,
    used,
    remaining: Math.max(0, DAILY_JOB_LIMIT - used),
    resetsAt: startOfNextDay.toISOString(),
  };
}

/** Upload user image to R2 and create a new Job record. */
export async function createJob(
  imageBuffer: Buffer,
  mimeType: string,
  userId: string,
  userRole: PrbUserRole,
): Promise<Job> {
  if (userRole !== PrbUserRole.ADMIN) {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const jobsToday = await jobRepo().count({
      where: { userId, createdAt: MoreThanOrEqual(startOfDay) },
    });

    if (jobsToday >= DAILY_JOB_LIMIT) {
      throw new HttpError(429, `Daily job limit of ${DAILY_JOB_LIMIT} reached. Try again tomorrow.`);
    }
  }

  const ext = mimeType.split('/')[1] ?? 'bin';
  const userImageKey = `prb/user/${uuidv4()}.${ext}`;

  await uploadToR2(userImageKey, imageBuffer, mimeType);

  const job = jobRepo().create({ userImageKey, userId });
  return jobRepo().save(job);
}

/** Return all jobs with presigned URLs for stored images. */
export async function getAllJobs(): Promise<object[]> {
  const jobs = await jobRepo().find({ order: { createdAt: 'DESC' } });

  return Promise.all(
    jobs.map(async (job) => ({
      id: job.id,
      status: job.status,
      userImageUrl: await getPresignedUrl(job.userImageKey),
      userImageKey: job.userImageKey,
      processedImageUrl: job.processedImageKey
        ? await getPresignedUrl(job.processedImageKey)
        : null,
      processedImageKey: job.processedImageKey,
      exampleImageUrls: await Promise.all(job.exampleImageKeys.map((k) => getPresignedUrl(k))),
      exampleImageKeys: job.exampleImageKeys,
      perturbedExampleImageUrls: await Promise.all(job.perturbedExampleImageKeys.map((k) => getPresignedUrl(k))),
      perturbedExampleImageKeys: job.perturbedExampleImageKeys,
      initialModelScore: job.initialModelScore,
      initialClass: job.initialClass,
      afterClass: job.afterClass,
      afterScore: job.afterScore,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })),
  );
}

/** Return a single job by ID with presigned URLs. */
export async function getJobById(id: string): Promise<object> {
  const job = await jobRepo().findOneBy({ id });

  if (!job) {
    throw new HttpError(404, `Job not found: ${id}`);
  }

  return {
    id: job.id,
    status: job.status,
    userImageUrl: await getPresignedUrl(job.userImageKey),
    userImageKey: job.userImageKey,
    processedImageUrl: job.processedImageKey
      ? await getPresignedUrl(job.processedImageKey)
      : null,
    processedImageKey: job.processedImageKey,
    exampleImageUrls: await Promise.all(job.exampleImageKeys.map((k) => getPresignedUrl(k))),
    exampleImageKeys: job.exampleImageKeys,
    perturbedExampleImageUrls: await Promise.all(job.perturbedExampleImageKeys.map((k) => getPresignedUrl(k))),
    perturbedExampleImageKeys: job.perturbedExampleImageKeys,
    initialModelScore: job.initialModelScore,
    initialClass: job.initialClass,
    afterClass: job.afterClass,
    afterScore: job.afterScore,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

/** Return the last 10 jobs belonging to a specific user, with presigned URLs. */
export async function getMyJobs(userId: string): Promise<object[]> {
  const jobs = await jobRepo().find({
    where: { userId },
    order: { createdAt: 'DESC' },
    take: 10,
  });

  return Promise.all(
    jobs.map(async (job) => ({
      id: job.id,
      status: job.status,
      userImageUrl: await getPresignedUrl(job.userImageKey),
      userImageKey: job.userImageKey,
      processedImageUrl: job.processedImageKey
        ? await getPresignedUrl(job.processedImageKey)
        : null,
      processedImageKey: job.processedImageKey,
      exampleImageUrls: await Promise.all(job.exampleImageKeys.map((k) => getPresignedUrl(k))),
      exampleImageKeys: job.exampleImageKeys,
      perturbedExampleImageUrls: await Promise.all(job.perturbedExampleImageKeys.map((k) => getPresignedUrl(k))),
      perturbedExampleImageKeys: job.perturbedExampleImageKeys,
      initialModelScore: job.initialModelScore,
      initialClass: job.initialClass,
      afterClass: job.afterClass,
      afterScore: job.afterScore,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })),
  );
}

/**
 * Transition a job from CLASSIFIED → PENDING (granted user confirms perturbation).
 * Only the job owner or an admin may call this.
 */
export async function proceedJob(
  id: string,
  requestingUserId: string,
  requestingUserRole: string,
): Promise<Job> {
  const job = await jobRepo().findOneBy({ id });

  if (!job) {
    throw new HttpError(404, `Job not found: ${id}`);
  }

  if (requestingUserRole !== 'admin' && job.userId !== requestingUserId) {
    throw new HttpError(403, 'You do not have permission to update this job');
  }

  if (job.status !== JobStatus.CLASSIFIED) {
    throw new HttpError(409, `Job must be in CLASSIFIED status to proceed (current: ${job.status})`);
  }

  job.status = JobStatus.PENDING;
  return jobRepo().save(job);
}

export interface AdminJobsFilter {
  status?: JobStatus;
  userSearch?: string;
  page?: number;
  limit?: number;
}

export interface AdminJobsResult {
  data: object[];
  total: number;
  page: number;
  limit: number;
}

/** Return all jobs for admins with pagination and optional filtering. */
export async function getAdminJobs(filter: AdminJobsFilter): Promise<AdminJobsResult> {
  const page = Math.max(1, filter.page ?? 1);
  const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
  const skip = (page - 1) * limit;

  const qb = jobRepo()
    .createQueryBuilder('job')
    .leftJoinAndSelect('job.user', 'user')
    .orderBy('job.createdAt', 'DESC')
    .skip(skip)
    .take(limit);

  if (filter.status !== undefined) {
    qb.andWhere('job.status = :status', { status: filter.status });
  }

  if (filter.userSearch !== undefined) {
    const term = `%${filter.userSearch.toLowerCase()}%`;
    qb.andWhere('(LOWER(user.email) LIKE :term OR LOWER(user.name) LIKE :term)', { term });
  }

  const [jobs, total] = await qb.getManyAndCount();

  const data = await Promise.all(
    jobs.map(async (job) => ({
      id: job.id,
      status: job.status,
      userId: job.userId,
      userEmail: job.user?.email ?? null,
      userName: job.user?.name ?? null,
      userImageUrl: await getPresignedUrl(job.userImageKey),
      userImageKey: job.userImageKey,
      processedImageUrl: job.processedImageKey
        ? await getPresignedUrl(job.processedImageKey)
        : null,
      processedImageKey: job.processedImageKey,
      exampleImageUrls: await Promise.all(job.exampleImageKeys.map((k) => getPresignedUrl(k))),
      exampleImageKeys: job.exampleImageKeys,
      perturbedExampleImageUrls: await Promise.all(job.perturbedExampleImageKeys.map((k) => getPresignedUrl(k))),
      perturbedExampleImageKeys: job.perturbedExampleImageKeys,
      initialModelScore: job.initialModelScore,
      initialClass: job.initialClass,
      afterClass: job.afterClass,
      afterScore: job.afterScore,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })),
  );

  return { data, total, page, limit };
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
  if (input.status !== undefined) job.status = input.status;

  if (input.exampleImageBuffers && input.exampleImageBuffers.length > 0) {
    const newKeys: string[] = [];
    for (let i = 0; i < input.exampleImageBuffers.length; i++) {
      const buf = input.exampleImageBuffers[i];
      const mime = input.exampleImageMimeTypes?.[i] ?? 'application/octet-stream';
      const ext = mime.split('/')[1] ?? 'bin';
      const key = `prb/examples/${uuidv4()}.${ext}`;
      await uploadToR2(key, buf, mime);
      newKeys.push(key);
    }
    job.exampleImageKeys = newKeys;
  }

  if (input.perturbedExampleImageBuffers && input.perturbedExampleImageBuffers.length > 0) {
    const newKeys: string[] = [];
    for (let i = 0; i < input.perturbedExampleImageBuffers.length; i++) {
      const buf = input.perturbedExampleImageBuffers[i];
      const mime = input.perturbedExampleImageMimeTypes?.[i] ?? 'application/octet-stream';
      const ext = mime.split('/')[1] ?? 'bin';
      const key = `prb/perturbed-examples/${uuidv4()}.${ext}`;
      await uploadToR2(key, buf, mime);
      newKeys.push(key);
    }
    job.perturbedExampleImageKeys = newKeys;
  }

  return jobRepo().save(job);
}
