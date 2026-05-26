import { Request, Response } from 'express';
import { createJob, getAllJobs, getAdminJobs, getDailyLimitInfo, deleteJob, getJobById, getMyJobs, updateJob, proceedJob, AdminJobsFilter } from '../services/jobs.service';
import { JobStatus } from '../entities/Job';
import { HttpError } from '../utils/httpError';

/** GET /jobs/daily-limit — granted or admin; returns daily job usage and limit */
export async function dailyLimitHandler(req: Request, res: Response): Promise<void> {
  try {
    const info = await getDailyLimitInfo(req.user!.id, req.user!.role);
    res.json(info);
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    console.error('[dailyLimitHandler]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** GET /jobs/admin/all — admin only; paginated list of all jobs with optional filtering */
export async function adminListJobsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { status, userSearch, page, limit } = req.query;

    if (status !== undefined && !Object.values(JobStatus).includes(status as JobStatus)) {
      res.status(400).json({ message: `status must be one of: ${Object.values(JobStatus).join(', ')}` });
      return;
    }

    const filter: AdminJobsFilter = {
      status: status as JobStatus | undefined,
      userSearch: typeof userSearch === 'string' ? userSearch : undefined,
      page: page !== undefined ? parseInt(page as string, 10) : undefined,
      limit: limit !== undefined ? parseInt(limit as string, 10) : undefined,
    };

    const result = await getAdminJobs(filter);
    res.json(result);
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    console.error('[adminListJobsHandler]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** POST /jobs — granted or admin only; requires image file upload */
export async function createJobHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'An image file is required (field name: image)' });
      return;
    }

    const job = await createJob(req.file.buffer, req.file.mimetype, req.user!.id, req.user!.role);
    res.status(201).json(job);
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    console.error('[createJobHandler]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** GET /jobs/my — granted or admin only; returns the last 10 jobs for the authenticated user */
export async function getMyJobsHandler(req: Request, res: Response): Promise<void> {
  try {
    const jobs = await getMyJobs(req.user!.id);
    res.json(jobs);
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    console.error('[getMyJobsHandler]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** GET /jobs — API key required; returns all jobs with presigned URLs */
export async function listJobsHandler(_req: Request, res: Response): Promise<void> {
  try {
    const jobs = await getAllJobs();
    res.json(jobs);
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    console.error('[listJobsHandler]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** GET /jobs/:id — API key required; returns a single job with presigned URLs */
export async function getJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const job = await getJobById(id);
    res.json(job);
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    console.error('[getJobHandler]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** POST /jobs/:id/proceed — granted/admin only; transitions job from CLASSIFIED → PENDING */
export async function proceedJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const job = await proceedJob(id, req.user!.id, req.user!.role);
    res.json(job);
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    console.error('[proceedJobHandler]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** DELETE /jobs/:id — job owner or admin only */
export async function deleteJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await deleteJob(id, req.user!.id, req.user!.role);
    res.status(204).send();
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    console.error('[deleteJobHandler]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/** PATCH /jobs/:id — API key required; updates job result fields */
export async function updateJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { initialModelScore, initialClass, afterClass, afterScore, status } = req.body;

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const processedImageFile = files?.['processedImage']?.[0];
    const exampleImageFiles = files?.['exampleImages'] ?? [];
    const perturbedExampleImageFiles = files?.['perturbedExampleImages'] ?? [];

    const input = {
      processedImageBuffer: processedImageFile?.buffer,
      processedImageMimeType: processedImageFile?.mimetype,
      initialModelScore: initialModelScore !== undefined ? parseFloat(initialModelScore) : undefined,
      initialClass: initialClass as string | undefined,
      afterClass: afterClass as string | undefined,
      afterScore: afterScore !== undefined ? parseFloat(afterScore) : undefined,
      status: status as JobStatus | undefined,
      exampleImageBuffers: exampleImageFiles.length > 0 ? exampleImageFiles.map((f) => f.buffer) : undefined,
      exampleImageMimeTypes: exampleImageFiles.length > 0 ? exampleImageFiles.map((f) => f.mimetype) : undefined,
      perturbedExampleImageBuffers: perturbedExampleImageFiles.length > 0 ? perturbedExampleImageFiles.map((f) => f.buffer) : undefined,
      perturbedExampleImageMimeTypes: perturbedExampleImageFiles.length > 0 ? perturbedExampleImageFiles.map((f) => f.mimetype) : undefined,
    };

    const job = await updateJob(id, input);
    res.json(job);
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    console.error('[updateJobHandler]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
