import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { CreateUserInput, UpdateUserInput } from '../validators/user.validator';
import { AppError } from '../utils/errors';
import { Role } from '@prisma/client';

export class UserService {
  async getAllUsers(role?: Role) {
    return userRepository.findAll(role);
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw AppError.notFound('User not found');
    return user;
  }

  async createUser(input: CreateUserInput) {
    const existing = await userRepository.findByEmailWithPassword(input.email);
    if (existing) throw AppError.conflict('Email address is already in use');

    const passwordHash = await bcrypt.hash(input.password, 10);
    return userRepository.create({ ...input, passwordHash });
  }

  async updateUser(id: string, input: UpdateUserInput) {
    const user = await userRepository.findById(id);
    if (!user) throw AppError.notFound('User not found');

    let passwordHash: string | undefined;
    if (input.password) {
      passwordHash = await bcrypt.hash(input.password, 10);
    }

    return userRepository.update(id, { ...input, passwordHash });
  }

  async deleteUser(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw AppError.notFound('User not found');
    return userRepository.delete(id);
  }
}

export const userService = new UserService();
