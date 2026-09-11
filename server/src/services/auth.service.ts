import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { tokenRepository } from '../repositories/token.repository';
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/errors';
import { LoginInput } from '../validators/auth.validator';

export class AuthService {
  async login(input: LoginInput) {
    const user = await userRepository.findByEmailWithPassword(input.email);
    if (!user || !user.isActive) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Update lastSeenAt
    await userRepository.update(user.id, { lastSeenAt: new Date() });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    // 7 days expiration for refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tokenRepository.saveRefreshToken(user.id, tokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: userPayload,
    };
  }

  async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw AppError.unauthorized('Refresh token is required');
    }

    const tokenHash = hashRefreshToken(rawRefreshToken);
    const tokenRecord = await tokenRepository.findValidRefreshToken(tokenHash);

    if (!tokenRecord || !tokenRecord.user.isActive) {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    // Refresh Token Rotation: Revoke old token
    await tokenRepository.revokeToken(tokenHash);

    const userPayload = {
      id: tokenRecord.user.id,
      name: tokenRecord.user.name,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role,
    };

    const newAccessToken = generateAccessToken(userPayload);
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRefreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tokenRepository.saveRefreshToken(tokenRecord.userId, newTokenHash, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: userPayload,
    };
  }

  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = hashRefreshToken(rawRefreshToken);
      await tokenRepository.revokeToken(tokenHash);
    }
  }

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    return user;
  }
}

export const authService = new AuthService();
