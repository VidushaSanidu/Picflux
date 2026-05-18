import { Request, Response, NextFunction } from 'express';
import { PrbUserRole } from '../entities/User';

/**
 * Factory that returns an Express middleware requiring the authenticated user
 * to have one of the specified roles. Must be used after jwtAuth.
 */
export function requireRole(...roles: PrbUserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
