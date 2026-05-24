import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { User, PrbUserRole } from '../entities/User';
import { HttpError } from '../utils/httpError';
import { sendVerificationEmail } from './email.service';

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const BCRYPT_ROUNDS = 12;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function findOrCreateGoogleUser(googleId: string, email: string, displayName?: string): Promise<User> {
  const userRepo = AppDataSource.getRepository(User);
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Already linked to this Google account
  const byGoogleId = await userRepo.findOne({ where: { googleId } });
  if (byGoogleId) return byGoogleId;

  // 2. Existing local account with same email — auto-link
  const byEmail = await userRepo.findOne({ where: { email: normalizedEmail } });
  if (byEmail) {
    byEmail.googleId = googleId;
    await userRepo.save(byEmail);
    return byEmail;
  }

  // 3. Brand new user
  const user = userRepo.create({
    email: normalizedEmail,
    passwordHash: null,
    googleId,
    username: normalizedEmail.split('@')[0],
    name: displayName ?? null,
    role: PrbUserRole.GENERAL,
    isVerified: true,
    verificationToken: null,
    verificationTokenExpiresAt: null,
  });
  return userRepo.save(user);
}

export async function register(email: string, password: string, name?: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new HttpError(400, 'Invalid email address');
  }

  if (password.length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters');
  }

  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email: normalizedEmail } });

  if (existing) {
    throw new HttpError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  const user = userRepo.create({
    email: normalizedEmail,
    passwordHash,
    username: normalizedEmail.split('@')[0],
    name: name?.trim() || null,
    role: PrbUserRole.GENERAL,
    isVerified: false,
    verificationToken,
    verificationTokenExpiresAt,
  });

  await userRepo.save(user);
  await sendVerificationEmail(normalizedEmail, verificationToken);
}

export async function login(email: string, password: string): Promise<User> {
  const normalizedEmail = email.toLowerCase().trim();
  const userRepo = AppDataSource.getRepository(User);

  const user = await userRepo.findOne({ where: { email: normalizedEmail } });

  // Constant-time comparison to avoid user enumeration via timing
  const dummyHash = '$2b$12$invalidhashusedtomaintaintimingX';
  const hashToCompare = user?.passwordHash ?? dummyHash;
  const match = await bcrypt.compare(password, hashToCompare);

  if (!user || !user.passwordHash || !match) {
    throw new HttpError(401, 'Invalid email or password');
  }

  if (!user.isVerified) {
    throw new HttpError(403, 'Email not verified. Please check your inbox.');
  }

  return user;
}

export async function verifyEmail(token: string): Promise<void> {
  if (!token) {
    throw new HttpError(400, 'Verification token is required');
  }

  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { verificationToken: token } });

  if (!user || !user.verificationTokenExpiresAt) {
    throw new HttpError(400, 'Invalid or expired verification link');
  }

  if (user.verificationTokenExpiresAt < new Date()) {
    throw new HttpError(400, 'Verification link has expired. Please register again.');
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiresAt = null;
  await userRepo.save(user);
}
