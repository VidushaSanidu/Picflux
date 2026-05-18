import { PrbUserRole } from '../entities/User';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: PrbUserRole;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: PrbUserRole;
    };
  }
}
