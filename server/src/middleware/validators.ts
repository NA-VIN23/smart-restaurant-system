import type { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validate = (validations: any[]) => async (req: Request, res: Response, next: NextFunction) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  return next();
};

export const createTableValidator = [
  body('table_number').isString().notEmpty().withMessage('Table number is required'),
  body('capacity').isInt({ gt: 0 }).withMessage('Capacity must be greater than 0'),
  body('type').optional().isIn(['Regular', 'VIP']).withMessage('Type must be Regular or VIP')
];

export const updateTableValidator = [
  body('capacity').optional().isInt({ gt: 0 }).withMessage('Capacity must be greater than 0'),
  body('type').optional().isIn(['Regular', 'VIP']).withMessage('Type must be Regular or VIP'),
  body('status').optional().isIn(['Available', 'Occupied', 'Reserved']).withMessage('Invalid status')
];

export const joinQueueValidator = [
  body('capacity_needed').isInt({ gt: 0 }).withMessage('Valid capacity is required'),
  body('type_preference').optional().isIn(['Regular', 'VIP'])
];

export const createReservationValidator = [
  body('table_id').isInt().withMessage('Table ID is required'),
  body('reservation_time').isISO8601().withMessage('Valid reservation time is required'),
  body('notes').optional().isString()
];

export const registerValidator = [
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['Customer', 'Manager', 'Admin']).withMessage('Role must be Customer, Manager, or Admin')
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isString().notEmpty().withMessage('Password is required')
];

export default {};
