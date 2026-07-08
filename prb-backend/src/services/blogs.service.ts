import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../config/database';
import { Blog, BlogStatus } from '../entities/Blog';
import { PrbUserRole } from '../entities/User';
import { uploadToR2, getPresignedUrl } from './r2.service';
import { HttpError } from '../utils/httpError';

const blogRepo = () => AppDataSource.getRepository(Blog);

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function countWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

function slugify(value: string): string {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  if (!normalized) {
    return 'blog-post';
  }

  return normalized.slice(0, 300);
}

async function resolveUniqueSlug(base: string, excludeBlogId?: string): Promise<string> {
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await blogRepo().findOne({ where: { slug: candidate }, select: ['id'] });

    if (!existing || existing.id === excludeBlogId) {
      return candidate;
    }

    suffix += 1;
    const suffixText = `-${suffix}`;
    const maxBaseLength = 300 - suffixText.length;
    candidate = `${base.slice(0, maxBaseLength)}${suffixText}`;
  }
}

function assertTitle(title: string): string {
  const normalized = normalizeWhitespace(title);
  if (!normalized) {
    throw new HttpError(400, 'title is required');
  }
  if (normalized.length > 256) {
    throw new HttpError(400, 'title must be 256 characters or fewer');
  }
  return normalized;
}

function assertCategory(category: string): string {
  const normalized = normalizeWhitespace(category);
  if (!normalized) {
    throw new HttpError(400, 'category is required');
  }
  if (normalized.length > 100) {
    throw new HttpError(400, 'category must be 100 characters or fewer');
  }
  return normalized;
}

function assertContent(content: string): string {
  const normalized = content.trim();
  const words = countWords(normalized);
  if (words < 50 || words > 2000) {
    throw new HttpError(400, 'content must contain between 50 and 2000 words');
  }
  return normalized;
}

async function mapBlogForPublic(blog: Blog): Promise<object> {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    category: blog.category,
    content: blog.content,
    status: blog.status,
    coverImageKey: blog.coverImageKey,
    coverImageUrl: await getPresignedUrl(blog.coverImageKey),
    author: {
      id: blog.userId,
      name: blog.user?.name ?? null,
      email: blog.user?.email ?? null,
    },
    publishedDate: blog.publishedDate,
    updatedDate: blog.updatedDate,
    createdAt: blog.createdAt,
  };
}

export interface CreateBlogInput {
  title: string;
  coverImageKey: string;
  content: string;
  slug?: string;
  category: string;
}

export interface UpdateBlogInput {
  title?: string;
  coverImageKey?: string;
  content?: string;
  slug?: string;
  category?: string;
}

export interface AdminBlogsFilter {
  status?: BlogStatus;
  page?: number;
  limit?: number;
}

export interface AdminBlogsResult {
  data: object[];
  total: number;
  page: number;
  limit: number;
}

export async function uploadBlogImage(
  imageBuffer: Buffer,
  mimeType: string,
  userId: string,
): Promise<{ key: string; url: string }> {
  const ext = mimeType.split('/')[1] ?? 'bin';
  const key = `prb/blogs/${userId}/${uuidv4()}.${ext}`;

  await uploadToR2(key, imageBuffer, mimeType);

  return {
    key,
    url: await getPresignedUrl(key),
  };
}

export async function createBlog(input: CreateBlogInput, userId: string): Promise<object> {
  const title = assertTitle(input.title);
  const category = assertCategory(input.category);
  const content = assertContent(input.content);

  const coverImageKey = input.coverImageKey.trim();
  if (!coverImageKey) {
    throw new HttpError(400, 'coverImageKey is required');
  }

  const rawSlugSource = input.slug?.trim() || title;
  const baseSlug = slugify(rawSlugSource);
  const slug = await resolveUniqueSlug(baseSlug);

  const blog = blogRepo().create({
    userId,
    title,
    coverImageKey,
    content,
    slug,
    status: BlogStatus.PENDING,
    category,
    publishedDate: null,
  });

  const saved = await blogRepo().save(blog);
  const withUser = await blogRepo().findOneOrFail({ where: { id: saved.id }, relations: ['user'] });
  return mapBlogForPublic(withUser);
}

export async function listApprovedBlogs(): Promise<object[]> {
  const blogs = await blogRepo().find({
    where: { status: BlogStatus.APPROVED },
    relations: ['user'],
    order: { publishedDate: 'DESC', createdAt: 'DESC' },
  });

  return Promise.all(blogs.map((blog) => mapBlogForPublic(blog)));
}

export async function getApprovedBlogBySlug(slug: string): Promise<object> {
  const blog = await blogRepo().findOne({
    where: { slug, status: BlogStatus.APPROVED },
    relations: ['user'],
  });

  if (!blog) {
    throw new HttpError(404, 'Blog not found');
  }

  return mapBlogForPublic(blog);
}

export async function listMyBlogs(userId: string): Promise<object[]> {
  const blogs = await blogRepo().find({
    where: { userId },
    relations: ['user'],
    order: { updatedDate: 'DESC' },
  });

  return Promise.all(blogs.map((blog) => mapBlogForPublic(blog)));
}

export async function updateBlog(
  blogId: string,
  input: UpdateBlogInput,
  requestingUserId: string,
  requestingUserRole: PrbUserRole,
): Promise<object> {
  const blog = await blogRepo().findOne({ where: { id: blogId }, relations: ['user'] });

  if (!blog) {
    throw new HttpError(404, 'Blog not found');
  }

  const isAdmin = requestingUserRole === PrbUserRole.ADMIN;
  if (!isAdmin && blog.userId !== requestingUserId) {
    throw new HttpError(403, 'You do not have permission to edit this blog');
  }

  let hasUserEditableChange = false;

  if (input.title !== undefined) {
    blog.title = assertTitle(input.title);
    hasUserEditableChange = true;
  }

  if (input.category !== undefined) {
    blog.category = assertCategory(input.category);
    hasUserEditableChange = true;
  }

  if (input.content !== undefined) {
    blog.content = assertContent(input.content);
    hasUserEditableChange = true;
  }

  if (input.coverImageKey !== undefined) {
    const coverImageKey = input.coverImageKey.trim();
    if (!coverImageKey) {
      throw new HttpError(400, 'coverImageKey cannot be empty');
    }
    blog.coverImageKey = coverImageKey;
    hasUserEditableChange = true;
  }

  if (input.slug !== undefined) {
    const trimmedSlug = input.slug.trim();
    if (!trimmedSlug) {
      throw new HttpError(400, 'slug cannot be empty');
    }
    const baseSlug = slugify(trimmedSlug);
    blog.slug = await resolveUniqueSlug(baseSlug, blog.id);
    hasUserEditableChange = true;
  }

  if (!isAdmin && hasUserEditableChange) {
    blog.status = BlogStatus.EDITED;
    blog.publishedDate = null;
  }

  const saved = await blogRepo().save(blog);
  const withUser = await blogRepo().findOneOrFail({ where: { id: saved.id }, relations: ['user'] });
  return mapBlogForPublic(withUser);
}

export async function updateBlogStatus(blogId: string, status: BlogStatus): Promise<object> {
  const blog = await blogRepo().findOne({ where: { id: blogId }, relations: ['user'] });

  if (!blog) {
    throw new HttpError(404, 'Blog not found');
  }

  blog.status = status;
  if (status === BlogStatus.APPROVED) {
    blog.publishedDate = new Date();
  }

  const saved = await blogRepo().save(blog);
  const withUser = await blogRepo().findOneOrFail({ where: { id: saved.id }, relations: ['user'] });
  return mapBlogForPublic(withUser);
}

export async function getAdminBlogs(filter: AdminBlogsFilter): Promise<AdminBlogsResult> {
  const page = Math.max(1, filter.page ?? 1);
  const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
  const skip = (page - 1) * limit;

  const qb = blogRepo()
    .createQueryBuilder('blog')
    .leftJoinAndSelect('blog.user', 'user')
    .orderBy('blog.updatedDate', 'DESC')
    .skip(skip)
    .take(limit);

  if (filter.status !== undefined) {
    qb.andWhere('blog.status = :status', { status: filter.status });
  }

  const [blogs, total] = await qb.getManyAndCount();
  const data = await Promise.all(blogs.map((blog) => mapBlogForPublic(blog)));

  return { data, total, page, limit };
}
