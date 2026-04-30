import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../entities/User';

/**
 * Factory that returns an Express middleware requiring the authenticated
 * user to have the specified role. Must be used after jwtAuth.
 */
export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
