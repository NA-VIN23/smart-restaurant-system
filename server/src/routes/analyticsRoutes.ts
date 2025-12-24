import { Router } from 'express';
import { 
  getTableAnalytics, 
  getUserStats, 
  getQueueAnalytics,
  getDashboardStats
} from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Manager/Admin routes
router.get('/tables', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncHandler(getTableAnalytics));
router.get('/users', authenticate, authorize(UserRole.ADMIN), asyncHandler(getUserStats));
router.get('/queue', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncHandler(getQueueAnalytics));
router.get('/dashboard', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncHandler(getDashboardStats));

export default router;