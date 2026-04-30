import { Request, Response, NextFunction } from 'express';
import { register, login } from '../services/auth.service';
import { signToken } from '../utils/jwt';
import { HttpError } from '../utils/httpError';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

function setAuthCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body as { email?: unknown; password?: unknown };

    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new HttpError(400, 'email and password are required');
    }

    const user = await register(email, password);
    const token = signToken(user.id, user.role);
    setAuthCookie(res, token);

    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body as { email?: unknown; password?: unknown };

    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new HttpError(400, 'email and password are required');
    }

    const user = await login(email, password);
    const token = signToken(user.id, user.role);
    setAuthCookie(res, token);

    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
}

export function logoutHandler(req: Request, res: Response): void {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out' });
}

export function meHandler(req: Request, res: Response): void {
  // req.user is guaranteed by jwtAuth middleware
  res.json(req.user);
}
