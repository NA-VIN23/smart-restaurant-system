import { Router } from 'express';
import { joinQueue, getQueue } from '../controllers/queue.controller';

const router = Router();

router.post('/join', joinQueue);
router.get('/', getQueue);

export default router;