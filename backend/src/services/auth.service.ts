import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { AuditLog, AuditAction } from '../entities/AuditLog';
import { HttpError } from '../utils/httpError';

export async function findOrCreateGoogleUser(googleId: string, email: string): Promise<User> {
  const userRepo = AppDataSource.getRepository(User);
  const auditRepo = AppDataSource.getRepository(AuditLog);

  // 1. Already linked to this Google account
  const byGoogleId = await userRepo.findOne({ where: { googleId } });
  if (byGoogleId) return byGoogleId;

  // 2. Existing local account with same email — auto-link
  const byEmail = await userRepo.findOne({ where: { email: email.toLowerCase().trim() } });
  if (byEmail) {
    byEmail.googleId = googleId;
    await userRepo.save(byEmail);
    return byEmail;
  }

  // 3. Brand new user
  const user = userRepo.create({
    email: email.toLowerCase().trim(),
    passwordHash: null,
    googleId,
    role: UserRole.USER,
  });
  await userRepo.save(user);

  await auditRepo.save(auditRepo.create({ userId: user.id, action: AuditAction.REGISTER }));

  return user;
}

const BCRYPT_ROUNDS = 12;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(email: string, password: string): Promise<User> {
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

  const user = userRepo.create({
    email: normalizedEmail,
    passwordHash,
    role: UserRole.USER,
  });

  await userRepo.save(user);

  // Audit
  const auditRepo = AppDataSource.getRepository(AuditLog);
  await auditRepo.save(auditRepo.create({ userId: user.id, action: AuditAction.REGISTER }));

  return user;
}

export async function login(email: string, password: string): Promise<User> {
  const normalizedEmail = email.toLowerCase().trim();
  const userRepo = AppDataSource.getRepository(User);

  const user = await userRepo.findOne({ where: { email: normalizedEmail } });

  // Constant-time comparison to avoid user enumeration via timing
  // Use dummyHash if user has no password (Google-only account) or doesn't exist
  const dummyHash = '$2b$12$invalidhashusedtomaintaintimingX';
  const hashToCompare = user?.passwordHash ?? dummyHash;
  const match = await bcrypt.compare(password, hashToCompare);

  if (!user || !user.passwordHash || !match) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const auditRepo = AppDataSource.getRepository(AuditLog);
  await auditRepo.save(auditRepo.create({ userId: user.id, action: AuditAction.LOGIN }));

  return user;
}
