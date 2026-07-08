import { Router } from 'express';
import { jwtAuth } from '../middleware/jwtAuth';
import { requireRole } from '../middleware/requireRole';
import { requireImageUpload } from '../middleware/uploadMiddleware';
import { PrbUserRole } from '../entities/User';
import {
  uploadBlogImageHandler,
  createBlogHandler,
  listApprovedBlogsHandler,
  getApprovedBlogBySlugHandler,
  listMyBlogsHandler,
  updateMyBlogHandler,
  adminUpdateBlogStatusHandler,
  adminListBlogsHandler,
} from '../controllers/blogs.controller';

const router = Router();

/** Authenticated users: create and edit their blogs */
router.post('/upload-image', jwtAuth, requireRole(PrbUserRole.GENERAL, PrbUserRole.GRANTED, PrbUserRole.ADMIN), requireImageUpload, uploadBlogImageHandler);
router.post('/', jwtAuth, requireRole(PrbUserRole.GENERAL, PrbUserRole.GRANTED, PrbUserRole.ADMIN), createBlogHandler);
router.get('/my', jwtAuth, requireRole(PrbUserRole.GENERAL, PrbUserRole.GRANTED, PrbUserRole.ADMIN), listMyBlogsHandler);
router.patch('/:id', jwtAuth, requireRole(PrbUserRole.GENERAL, PrbUserRole.GRANTED, PrbUserRole.ADMIN), updateMyBlogHandler);

/** Admin moderation */
router.get('/admin/all', jwtAuth, requireRole(PrbUserRole.ADMIN), adminListBlogsHandler);
router.patch('/:id/status', jwtAuth, requireRole(PrbUserRole.ADMIN), adminUpdateBlogStatusHandler);

/** Public: only approved blogs */
router.get('/', listApprovedBlogsHandler);
router.get('/:slug', getApprovedBlogBySlugHandler);

export default router;
