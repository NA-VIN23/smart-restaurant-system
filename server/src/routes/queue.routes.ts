
import { Router } from 'express';
import { joinQueue, getQueue, updateQueueStatus } from '../controllers/queue.controller';

const router = Router();

// POST /api/queue/join
router.post('/join', joinQueue);

// GET /api/queue
router.get('/', getQueue);

// PUT /api/queue/:id/status
router.put('/:id/status', updateQueueStatus);

export default router;