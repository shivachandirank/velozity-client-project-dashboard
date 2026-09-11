import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { Role } from '@prisma/client';

export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const roleParam = req.query.role as Role | undefined;
      const users = await userService.getAllUsers(roleParam);
      return res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createUserSchema.parse(req.body);
      const user = await userService.createUser(input);
      return res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateUserSchema.parse(req.body);
      const user = await userService.updateUser(req.params.id, input);
      return res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deleteUser(req.params.id);
      return res.json({ success: true, data: { message: 'User deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
