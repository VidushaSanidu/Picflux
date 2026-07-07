import { Router } from 'express';
import { jwtAuth } from '../middleware/jwtAuth';
import { requireRole } from '../middleware/requireRole';
import { PrbUserRole } from '../entities/User';
import {
  createContactInquiryHandler,
  deleteContactInquiryHandler,
  listContactInquiriesHandler,
  markContactInquiryReadHandler,
} from '../controllers/contacts.controller';

const router = Router();

/** POST /contacts — public; create a contact inquiry */
router.post('/', createContactInquiryHandler);

/** GET /contacts — admin only; list all inquiries */
router.get('/', jwtAuth, requireRole(PrbUserRole.ADMIN), listContactInquiriesHandler);

/** PATCH /contacts/:id/read — admin only; mark inquiry as read */
router.patch('/:id/read', jwtAuth, requireRole(PrbUserRole.ADMIN), markContactInquiryReadHandler);

/** DELETE /contacts/:id — admin only; delete inquiry */
router.delete('/:id', jwtAuth, requireRole(PrbUserRole.ADMIN), deleteContactInquiryHandler);

export default router;