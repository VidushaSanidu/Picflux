import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User, PrbUserRole } from '../entities/User';
import { HttpError } from '../utils/httpError';
import { sendAccessGrantedEmail } from './email.service';

const BCRYPT_ROUNDS = 12;

export async function listUsers(): Promise<Pick<User, 'id' | 'email' | 'role' | 'waitlist' | 'createdAt'>[]> {
  const users = await AppDataSource.getRepository(User).find({
    order: { createdAt: 'DESC' },
  });

  return users.map(({ id, email, role, waitlist, createdAt }) => ({ id, email, role, waitlist, createdAt }));
}

export async function updateUserRole(userId: string, newRole: PrbUserRole): Promise<Pick<User, 'id' | 'email' | 'role'>> {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id: userId });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  user.role = newRole;
  await userRepo.save(user);

  if (newRole === PrbUserRole.GRANTED) {
    await sendAccessGrantedEmail(user.email, user.name);
  }

  return { id: user.id, email: user.email, role: user.role };
}

export interface UpdateProfileInput {
  name?: string;
  password?: string;
  currentPassword?: string;
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<Pick<User, 'id' | 'email' | 'name' | 'role'>> {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id: userId });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (input.name !== undefined) {
    user.name = input.name.trim() || null;
  }

  if (input.password !== undefined) {
    if (!input.currentPassword) {
      throw new HttpError(400, 'currentPassword is required to change your password');
    }

    // Google-only accounts have no password hash
    if (!user.passwordHash) {
      throw new HttpError(400, 'Cannot set a password on an account that uses Google sign-in only');
    }

    const match = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!match) {
      throw new HttpError(401, 'Current password is incorrect');
    }

    if (input.password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters');
    }
    user.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  }

  await userRepo.save(user);

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function setUserWaitlist(userId: string, waitlist: boolean): Promise<Pick<User, 'id' | 'email' | 'waitlist'>> {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id: userId });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  user.waitlist = waitlist;
  await userRepo.save(user);

  return { id: user.id, email: user.email, waitlist: user.waitlist };
}

export async function deleteUser(userId: string): Promise<void> {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id: userId });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  await userRepo.remove(user);
}
