import { Router } from 'express';
import { joinQueue, getQueue, updateQueueStatus, getMyQueueStatus } from '../controllers/queue.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// POST /api/queue/join - Secured
router.post('/join', authenticateToken, joinQueue);

// GET /api/queue - Secured (or Public?) 
// User said "if only user logs in then we can add the queue...". 
// Viewing usually requires login too for specific user data, but generic view might be public.
// Assuming secure for now based on "secure the endpoints".
router.get('/', authenticateToken, getQueue);

// GET /api/queue/my-status - Public (Status check based on IDs)
router.get('/my-status', getMyQueueStatus);

// PUT /api/queue/:id/status - Secured
router.put('/:id/status', authenticateToken, updateQueueStatus);

export default router;