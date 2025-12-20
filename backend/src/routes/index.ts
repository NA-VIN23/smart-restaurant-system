import { Router } from 'express';
import authRoutes from './auth.routes';
import tableRoutes from './table.routes';
import reservationRoutes from './reservation.routes';
import queueRoutes from './queue.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tables', tableRoutes);
router.use('/reservations', reservationRoutes);
router.use('/queue', queueRoutes);

export default router;
