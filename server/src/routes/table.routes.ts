import { Router } from 'express';
import { getTables } from '../controllers/table.controller';

const router = Router();

// GET /api/tables
router.get('/', getTables);

export default router;