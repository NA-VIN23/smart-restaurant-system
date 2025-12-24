import type { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = typeof authHeader === 'string' && authHeader.split(' ')[1];

  if (!token) {
    // allow unauthenticated access for public routes
    (req as any).user = null;
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const payload = jwt.verify(token, secret) as any;
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (roles.length === 0) return next();
    if (!roles.includes(user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
    next();
  };
};
