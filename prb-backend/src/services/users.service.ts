import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User, PrbUserRole } from '../entities/User';
import { HttpError } from '../utils/httpError';

const BCRYPT_ROUNDS = 12;

export async function listUsers(): Promise<Pick<User, 'id' | 'email' | 'role' | 'createdAt'>[]> {
  const users = await AppDataSource.getRepository(User).find({
    order: { createdAt: 'DESC' },
  });

  return users.map(({ id, email, role, createdAt }) => ({ id, email, role, createdAt }));
}

export async function updateUserRole(userId: string, newRole: PrbUserRole): Promise<Pick<User, 'id' | 'email' | 'role'>> {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id: userId });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  user.role = newRole;
  await userRepo.save(user);

  return { id: user.id, email: user.email, role: user.role };
}

export interface UpdateProfileInput {
  name?: string;
  username?: string;
  password?: string;
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<Pick<User, 'id' | 'email' | 'username' | 'name' | 'role'>> {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id: userId });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (input.username !== undefined) {
    const trimmed = input.username.trim();
    if (!trimmed) {
      throw new HttpError(400, 'username cannot be empty');
    }
    user.username = trimmed;
  }

  if (input.name !== undefined) {
    user.name = input.name.trim() || null;
  }

  if (input.password !== undefined) {
    if (input.password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters');
    }
    user.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  }

  await userRepo.save(user);

  return { id: user.id, email: user.email, username: user.username, name: user.name, role: user.role };
}
