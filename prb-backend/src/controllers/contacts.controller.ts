import { Request, Response, NextFunction } from 'express';
import {
  createContactInquiry,
  listContactInquiries,
  markContactInquiryAsRead,
  deleteContactInquiry,
} from '../services/contacts.service';
import { HttpError } from '../utils/httpError';

interface CreateContactBody {
  name?: unknown;
  workEmail?: unknown;
  workemail?: unknown;
  companyName?: unknown;
  companyWebsite?: unknown;
  role?: unknown;
  message?: unknown;
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeOptional(value: unknown): string | undefined {
  const normalized = asTrimmedString(value);
  return normalized ?? undefined;
}

const WORK_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createContactInquiryHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as CreateContactBody;

    const name = asTrimmedString(body.name);
    if (!name) {
      throw new HttpError(400, 'name is required');
    }

    const workEmailRaw = asTrimmedString(body.workEmail ?? body.workemail);
    if (!workEmailRaw) {
      throw new HttpError(400, 'workEmail is required');
    }
    const workEmail = workEmailRaw.toLowerCase();
    if (!WORK_EMAIL_REGEX.test(workEmail)) {
      throw new HttpError(400, 'workEmail must be a valid email address');
    }

    const message = asTrimmedString(body.message);
    if (!message) {
      throw new HttpError(400, 'message is required');
    }

    const companyWebsite = normalizeOptional(body.companyWebsite);
    if (companyWebsite) {
      try {
        // Validate URL format while accepting any valid protocol.
        // eslint-disable-next-line no-new
        new URL(companyWebsite);
      } catch {
        throw new HttpError(400, 'companyWebsite must be a valid URL');
      }
    }

    const inquiry = await createContactInquiry({
      name,
      workEmail,
      companyName: normalizeOptional(body.companyName),
      companyWebsite,
      role: normalizeOptional(body.role),
      message,
    });

    res.status(201).json(inquiry);
  } catch (err) {
    next(err);
  }
}

export async function listContactInquiriesHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const inquiries = await listContactInquiries();
    res.json(inquiries);
  } catch (err) {
    next(err);
  }
}

export async function markContactInquiryReadHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const inquiry = await markContactInquiryAsRead(req.params.id);
    res.json(inquiry);
  } catch (err) {
    next(err);
  }
}

export async function deleteContactInquiryHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteContactInquiry(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}