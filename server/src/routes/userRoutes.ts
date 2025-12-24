import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
const { asyncHandler } = require('../middleware/errorHandler');
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = Router();

// Admin-only user management
router.get('/users', authenticate, authorize(UserRole.ADMIN), asyncHandler(getAllUsers));
router.get('/users/:id', authenticate, authorize(UserRole.ADMIN), asyncHandler(getUserById));
router.put('/users/:id', authenticate, authorize(UserRole.ADMIN), asyncHandler(updateUser));
router.delete('/users/:id', authenticate, authorize(UserRole.ADMIN), asyncHandler(deleteUser));

export default router;
