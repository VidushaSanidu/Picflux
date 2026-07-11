import { Request, Response, NextFunction } from 'express';
import {
  uploadBlogImage,
  createBlog,
  listApprovedBlogs,
  getApprovedBlogBySlug,
  listMyBlogs,
  updateBlog,
  updateBlogStatus,
  getAdminBlogs,
  getBlogById,
} from '../services/blogs.service';
import { BlogStatus } from '../entities/Blog';
import { HttpError } from '../utils/httpError';

interface CreateBlogBody {
  title?: unknown;
  coverImageKey?: unknown;
  content?: unknown;
  slug?: unknown;
  category?: unknown;
}

interface UpdateBlogBody {
  title?: unknown;
  coverImageKey?: unknown;
  content?: unknown;
  slug?: unknown;
  category?: unknown;
}

interface UpdateStatusBody {
  status?: unknown;
}

function asOptionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  return value.trim();
}

function asRequiredTrimmedString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, `${field} is required`);
  }
  return value.trim();
}

export async function uploadBlogImageHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw new HttpError(400, 'An image file is required (field name: image)');
    }

    const result = await uploadBlogImage(req.file.buffer, req.file.mimetype, req.user!.id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function createBlogHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as CreateBlogBody;

    const blog = await createBlog(
      {
        title: asRequiredTrimmedString(body.title, 'title'),
        coverImageKey: asRequiredTrimmedString(body.coverImageKey, 'coverImageKey'),
        content: asRequiredTrimmedString(body.content, 'content'),
        slug: asOptionalTrimmedString(body.slug),
        category: asRequiredTrimmedString(body.category, 'category'),
      },
      req.user!.id,
    );

    res.status(201).json(blog);
  } catch (err) {
    next(err);
  }
}

export async function listApprovedBlogsHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const blogs = await listApprovedBlogs();
    res.json(blogs);
  } catch (err) {
    next(err);
  }
}

export async function getApprovedBlogBySlugHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const blog = await getApprovedBlogBySlug(req.params.slug);
    res.json(blog);
  } catch (err) {
    next(err);
  }
}

export async function getBlogByIdHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const blog = await getBlogById(req.params.id, req.user!.id, req.user!.role);
    res.json(blog);
  } catch (err) {
    next(err);
  }
}

export async function listMyBlogsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const blogs = await listMyBlogs(req.user!.id);
    res.json(blogs);
  } catch (err) {
    next(err);
  }
}

export async function updateMyBlogHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as UpdateBlogBody;

    const blog = await updateBlog(
      req.params.id,
      {
        title: asOptionalTrimmedString(body.title),
        coverImageKey: asOptionalTrimmedString(body.coverImageKey),
        content: asOptionalTrimmedString(body.content),
        slug: asOptionalTrimmedString(body.slug),
        category: asOptionalTrimmedString(body.category),
      },
      req.user!.id,
      req.user!.role,
    );

    res.json(blog);
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateBlogStatusHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as UpdateStatusBody;
    if (typeof body.status !== 'string' || !Object.values(BlogStatus).includes(body.status as BlogStatus)) {
      throw new HttpError(400, `status must be one of: ${Object.values(BlogStatus).join(', ')}`);
    }

    const blog = await updateBlogStatus(req.params.id, body.status as BlogStatus);
    res.json(blog);
  } catch (err) {
    next(err);
  }
}

export async function adminListBlogsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.query.status;
    if (status !== undefined && !Object.values(BlogStatus).includes(status as BlogStatus)) {
      throw new HttpError(400, `status must be one of: ${Object.values(BlogStatus).join(', ')}`);
    }

    const page = req.query.page !== undefined ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit !== undefined ? parseInt(req.query.limit as string, 10) : undefined;

    const blogs = await getAdminBlogs({
      status: status as BlogStatus | undefined,
      page,
      limit,
    });

    res.json(blogs);
  } catch (err) {
    next(err);
  }
}
