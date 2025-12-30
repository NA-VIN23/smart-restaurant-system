import { Router } from 'express';
import { getTables, addTable, updateTable, deleteTable } from '../controllers/table.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// GET /api/tables - Public (often allowed to view tables before login)
// However, user said "if only user logs in then we can ... make reservations".
// Viewing tables might be needed for Landing page "View Tables".
// I'll keep GET public for now unless "secure the endpoints for viewing tables" was explicit.
// "secure the endpoints for viewing tables" -> OK, I must secure GET too.
router.get('/', authenticateToken, getTables);

// POST /api/tables (Add Table) - Secured
router.post('/', authenticateToken, addTable);

// PUT /api/tables/:id (Update Table) - Secured
router.put('/:id', authenticateToken, updateTable);

// DELETE /api/tables/:id (Delete Table) - Secured
router.delete('/:id', authenticateToken, deleteTable);

export default router;