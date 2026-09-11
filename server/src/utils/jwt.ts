import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { AuthenticatedUserPayload } from '../types';

export function generateAccessToken(user: AuthenticatedUserPayload): string {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as any }
  );
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string): AuthenticatedUserPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthenticatedUserPayload;
}
