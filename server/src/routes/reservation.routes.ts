import { Router } from 'express';
import { createReservation, getReservations, updateReservationStatus } from '../controllers/reservation.controller';
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
import { getUserReservations, deleteApprovedReservations } from '../controllers/reservation.controller';
router.get('/my-reservations', authenticateToken, getUserReservations);

// Manager only? or authenticated?
// For now, simple auth.
router.get('/', authenticateToken, getReservations);
router.put('/:id/status', authenticateToken, updateReservationStatus);
router.delete('/approved', authenticateToken, deleteApprovedReservations);

export default router;
