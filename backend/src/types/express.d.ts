import { UserRole } from '../entities/User';

/**
 * Augment Express's Request so TypeScript knows the shape of req.user
 * after jwtAuth or apiKeyAuth middleware has run.
 */
declare global {
  namespace Express {
    interface User {
      id: string;
      role: UserRole;
    }
  }
}

export {};
