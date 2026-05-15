import { Request, Response } from 'express';
import { createJob, getAllJobs, updateJob } from '../services/jobs.service';
import { HttpError } from '../utils/httpError';

/** POST /jobs — public; requires image file upload */
export async function createJobHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'An image file is required (field name: image)' });
      return;
    }

    const job = await createJob(req.file.buffer, req.file.mimetype);
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

/** PATCH /jobs/:id — API key required; updates job result fields */
export async function updateJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { initialModelScore, initialClass, afterClass, afterScore } = req.body;

    const input = {
      processedImageBuffer: req.file?.buffer,
      processedImageMimeType: req.file?.mimetype,
      initialModelScore: initialModelScore !== undefined ? parseFloat(initialModelScore) : undefined,
      initialClass: initialClass as string | undefined,
      afterClass: afterClass as string | undefined,
      afterScore: afterScore !== undefined ? parseFloat(afterScore) : undefined,
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
