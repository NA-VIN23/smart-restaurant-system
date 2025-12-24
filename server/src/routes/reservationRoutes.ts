import { Router } from 'express';
import {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservation,
  cancelReservation
} from '../controllers/reservationController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
const { asyncHandler } = require('../middleware/errorHandler');
import { validate, createReservationValidator } from '../middleware/validators';

const router = Router();

// Customer: create reservation
router.post('/reservations', authenticate, validate(createReservationValidator), asyncHandler(createReservation));

// Customer: list own reservations
router.get('/reservations', authenticate, asyncHandler(getMyReservations));

// Manager/Admin: get all reservations
router.get('/reservations/all', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncHandler(getAllReservations));

// Update reservation (owner or manager)
router.put('/reservations/:id', authenticate, asyncHandler(updateReservation));

// Cancel reservation
router.put('/reservations/:id/cancel', authenticate, asyncHandler(cancelReservation));

export default router;
