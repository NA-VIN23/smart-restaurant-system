import { Router } from 'express';
import {
  joinQueue,
  getQueueStatus,
  getAllQueueEntries,
  leaveQueue,
  seatCustomer
} from '../controllers/queueController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, joinQueueValidator } from '../middleware/validators';

const router = Router();

// Customer: join queue
router.post('/queue', authenticate, validate(joinQueueValidator), asyncHandler(joinQueue));

// Customer: get own queue status
router.get('/queue/position', authenticate, asyncHandler(getQueueStatus));

// Manager/Admin: get any user's position
router.get('/queue/position/:userId', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncHandler(async (req: any, res: any) => {
  // Reuse controller logic by temporarily setting req.user
  req.user = { id: parseInt(req.params.userId, 10) };
  return getQueueStatus(req, res);
}));

// Manager/Admin: view all queue entries
router.get('/queue', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncHandler(getAllQueueEntries));

// Customer: leave queue
router.post('/queue/leave', authenticate, asyncHandler(leaveQueue));

// Manager: seat customer
router.post('/queue/seat', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncHandler(seatCustomer));

export default router;
