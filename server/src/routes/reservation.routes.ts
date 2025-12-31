import { Router } from 'express';
import { createReservation, getReservations, updateReservationStatus, cancelReservation, deleteUserReservation } from '../controllers/reservation.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public route to creat reservation? Or Authenticated?
// Reqs say "in reservation button in the customer... ask name...".
// Ideally should use logged in user ID if available.
// Let's protect it OR allow guest if we want. Project seems to favor login.
// But we can check `authenticateToken` for creation.
// Create reservation (Auth required to link user)
router.post('/', authenticateToken, createReservation);

// User Reservations
import { getUserReservations, deleteApprovedReservations, deleteReservationByManager } from '../controllers/reservation.controller';
// Manager Routes (Must be defined BEFORE generic /:id routes)
router.get('/', authenticateToken, getReservations);
router.put('/:id/status', authenticateToken, updateReservationStatus);
router.delete('/approved', authenticateToken, deleteApprovedReservations);
router.delete('/manager/:id', authenticateToken, deleteReservationByManager);

// User Routes
router.get('/my-reservations', authenticateToken, getUserReservations);
router.put('/:id/cancel', authenticateToken, cancelReservation);
// Generic Delete (User) - Must be last because it matches /:id
router.delete('/:id', authenticateToken, deleteUserReservation);

export default router;
