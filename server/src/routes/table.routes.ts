
import { Router } from 'express';
import { getTables, addTable, updateTable, deleteTable } from '../controllers/table.controller';

const router = Router();

// GET /api/tables
router.get('/', getTables);

// POST /api/tables (Add Table)
router.post('/', addTable);

// PUT /api/tables/:id (Update Table)
router.put('/:id', updateTable);

// DELETE /api/tables/:id (Delete Table)
router.delete('/:id', deleteTable);

export default router;