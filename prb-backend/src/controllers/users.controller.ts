import { Request, Response, NextFunction } from 'express';
import { PrbUserRole } from '../entities/User';
import { listUsers, updateUserRole, updateUserProfile, setUserWaitlist, deleteUser, UpdateProfileInput } from '../services/users.service';
import { HttpError } from '../utils/httpError';

export async function listUsersHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function updateRoleHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body as { role?: unknown };

    if (!role || !Object.values(PrbUserRole).includes(role as PrbUserRole)) {
      throw new HttpError(400, `role must be one of: ${Object.values(PrbUserRole).join(', ')}`);
    }

    const updated = await updateUserRole(id, role as PrbUserRole);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function updateProfileHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, password, currentPassword } = req.body as UpdateProfileInput & { currentPassword?: string };

    if (name === undefined && password === undefined) {
      throw new HttpError(400, 'Provide at least one field to update: name or password');
    }

    const updated = await updateUserProfile(req.user!.id, { name, password, currentPassword });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function setWaitlistHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updated = await setUserWaitlist(id, true);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteUserHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await deleteUser(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
