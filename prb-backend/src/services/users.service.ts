import { AppDataSource } from '../config/database';
import { User, PrbUserRole } from '../entities/User';
import { HttpError } from '../utils/httpError';

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
