import { Request, Response } from 'express';
import { createJob, getAllJobs, getJobById, updateJob, proceedJob } from '../services/jobs.service';
import { JobStatus } from '../entities/Job';
import { HttpError } from '../utils/httpError';

/** POST /jobs — granted or admin only; requires image file upload */
export async function createJobHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'An image file is required (field name: image)' });
      return;
    }

    const job = await createJob(req.file.buffer, req.file.mimetype, req.user!.id);
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

/** PATCH /jobs/:id — API key required; updates job result fields */
export async function updateJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { initialModelScore, initialClass, afterClass, afterScore, status } = req.body;

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const processedImageFile = files?.['processedImage']?.[0];
    const exampleImageFiles = files?.['exampleImages'] ?? [];

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
