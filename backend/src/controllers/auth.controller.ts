import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { User } from '../models/user.model';

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}


const signToken = (id: number, role: string): string => {
  const payload = { id, role };
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const options: SignOptions = {
    // cast to any to satisfy SignOptions typing for env var values
    expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any,
  };
  
  return jwt.sign(payload, secret, options);
};

const createSendToken = (
  user: any,
  statusCode: number,
  res: Response
): void => {
  const token = signToken(user.id, user.role);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (process.env.JWT_COOKIE_EXPIRES_IN
          ? parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
          : 24 * 60 * 60 * 1000)
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // 1) Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return next(new AppError('Email already in use!', 400));
    }

    // 2) Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3) Create new user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'customer']
    );

    // 4) Get the newly created user
    const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [
      (result as any).insertId,
    ]);

    // 5) Generate token and send response
    createSendToken(
      Array.isArray(newUser) ? newUser[0] : newUser,
      201,
      res
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exists && password is correct
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (!Array.isArray(users) || users.length === 0) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const user = users[0] as any;
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      if (process.env.RUN_INTEGRATION === 'true') console.log('protect: no token found on request');
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verification token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as any;
    if (process.env.RUN_INTEGRATION === 'true') console.log('protect: token decoded', decoded);

    // 3) Check if user still exists
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [
      decoded.id,
    ]);

    if (!Array.isArray(users) || users.length === 0) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4) Check if user changed password after the token was issued
    // (This requires a passwordChangedAt field in the users table)

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = users[0] as any;
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Ensure req.user exists and has role
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};
