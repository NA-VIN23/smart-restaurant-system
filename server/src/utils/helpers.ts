import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export const successResponse = (message: string, data?: any) => ({ success: true, message, data });
export const errorResponse = (message: string, details?: any) => ({ success: false, message, details });

export const calculateEstimatedWaitTime = (position: number) => {
  // Simple heuristic: 5 minutes per position
  const minutes = Math.max(0, Math.floor(position) * 5);
  return minutes;
};

export const isFutureDate = (date: Date) => {
  return date.getTime() > Date.now();
};

export const validateEmail = (email: string) => {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
};

export const validatePassword = (password: string) => {
  if (!password || password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
  return { valid: true };
};

export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: object, expiresIn: string | number = '7d') => {
  const secret = (process.env.JWT_SECRET || 'dev_secret') as string;
  // use any cast to avoid tight jwt typings in this utility
  return (jwt as any).sign(payload, secret, { expiresIn } as any);
};

export default {};
