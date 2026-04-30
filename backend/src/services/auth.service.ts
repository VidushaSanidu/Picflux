import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { AuditLog, AuditAction } from '../entities/AuditLog';
import { HttpError } from '../utils/httpError';

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
  const dummyHash = '$2b$12$invalidhashusedtomaintaintimingX';
  const hashToCompare = user ? user.passwordHash : dummyHash;
  const match = await bcrypt.compare(password, hashToCompare);

  if (!user || !match) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const auditRepo = AppDataSource.getRepository(AuditLog);
  await auditRepo.save(auditRepo.create({ userId: user.id, action: AuditAction.LOGIN }));

  return user;
}
