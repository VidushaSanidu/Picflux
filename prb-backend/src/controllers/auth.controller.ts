import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport';
import { register, login, verifyEmail } from '../services/auth.service';
import { signToken } from '../utils/jwt';
import { HttpError } from '../utils/httpError';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';

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

function getFrontendOrigin(): string {
  return "https://www.perturbai.io"; // Use production frontend URL for redirects
}

export async function registerHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name } = req.body as { email?: unknown; password?: unknown; name?: unknown };

    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new HttpError(400, 'email and password are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpError(400, 'Invalid email address');
    }

    if (password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters');
    }

    await register(email, password, typeof name === 'string' ? name : undefined);
    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmailHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    await verifyEmail(token);
    const frontendOrigin = getFrontendOrigin();
    res.redirect(`${frontendOrigin}`);
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email?: unknown; password?: unknown };

    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new HttpError(400, 'email and password are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpError(400, 'Invalid email address');
    }

    if (password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters');
    }

    const user = await login(email, password);
    const token = signToken(user.id, user.role);
    setAuthCookie(res, token);

    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    next(err);
  }
}

export function logoutHandler(_req: Request, res: Response): void {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out' });
}

export async function meHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await AppDataSource.getRepository(User).findOneBy({ id: req.user!.id });
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    next(err);
  }
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export const googleInitHandler = passport.authenticate('google', {
  scope: ['email', 'profile'],
  session: false,
});

export function googleCallbackHandler(req: Request, res: Response, next: NextFunction): void {
  const frontendOrigin = getFrontendOrigin();

  passport.authenticate(
    'google',
    { session: false, failureRedirect: `${frontendOrigin}/login?error=oauth_failed` },
    (err: Error | null, user: User | false) => {
      if (err || !user) {
        res.redirect(`${frontendOrigin}/login?error=oauth_failed`);
        return;
      }
      const token = signToken(user.id, user.role);
      setAuthCookie(res, token);
      res.redirect(`https://www.perturbai.io`); // Redirect to main app after successful login
    },
  )(req, res, next);
}
