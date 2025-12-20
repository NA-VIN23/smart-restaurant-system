import { Router } from 'express';
import * as queueController from '../controllers/queue.controller';
import * as authController from '../controllers/auth.controller';
import { body, param } from 'express-validator';
import { runValidation } from '../middleware/validate.middleware';

const router = Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Queue management routes
router
  .route('/')
  .get(authController.restrictTo('manager', 'admin'), queueController.getQueue)
  .post(
    body('user_id').isInt().withMessage('user_id must be an integer'),
    body('party_size').isInt({ min: 1 }).withMessage('party_size must be >= 1'),
    runValidation,
    queueController.joinQueue
  );

router
  .route('/:id')
  .patch(
    authController.restrictTo('manager', 'admin'),
    body('status').isIn(['waiting','seated','cancelled','no-show']).withMessage('Invalid status'),
    runValidation,
    queueController.updateQueueStatus
  )
  .delete(queueController.leaveQueue);

// Get queue position for a user
router.get('/position/:userId', param('userId').isInt().withMessage('userId must be an integer'), runValidation, queueController.getQueuePosition);

export default router;
