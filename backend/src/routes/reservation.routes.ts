import { Router } from 'express';
import * as reservationController from '../controllers/reservation.controller';
import * as authController from '../controllers/auth.controller';
import { body, param } from 'express-validator';
import { runValidation } from '../middleware/validate.middleware';

const router = Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Routes for reservation management
router
  .route('/')
  .get(reservationController.getAllReservations)
  .post(
    authController.restrictTo('customer', 'manager', 'admin'),
    body('user_id').isInt().withMessage('user_id is required'),
    body('table_id').isInt().withMessage('table_id is required'),
    body('reservation_time').isISO8601().withMessage('reservation_time must be a valid ISO8601 datetime'),
    body('party_size').isInt({ min: 1 }).withMessage('party_size must be >= 1'),
    runValidation,
    reservationController.createReservation
  );

router
  .route('/:id')
  .get(reservationController.getReservation)
  .patch(
    authController.restrictTo('customer', 'manager', 'admin'),
    reservationController.updateReservation
  )
  .delete(
    authController.restrictTo('customer', 'manager', 'admin'),
    reservationController.cancelReservation
  );

// Get reservations by user
router.get('/user/:userId', param('userId').isInt().withMessage('userId must be an integer'), runValidation, reservationController.getUserReservations);

// Update reservation status (for managers/admins)
router.patch(
  '/:id/status',
  authController.restrictTo('manager', 'admin'),
  body('status').isIn(['confirmed','seated','completed','cancelled','no-show']).withMessage('Invalid status'),
  runValidation,
  reservationController.updateReservationStatus
);

export default router;
