import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as tableController from '../controllers/tableController';
import { UserRole } from '../types';
import { validate, createTableValidator, updateTableValidator } from '../middleware/validators';

const router = Router();

// Public
router.get('/tables', tableController.getAllTables);
router.get('/tables/available', tableController.getAvailableTables);
router.get('/tables/:id', tableController.getTableById);

// Manager/Admin (protected)
router.post('/tables', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), validate(createTableValidator), tableController.createTable);
router.put('/tables/:id', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), validate(updateTableValidator), tableController.updateTable);
router.delete('/tables/:id', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), tableController.deleteTable);
router.post('/tables/:id/vacate', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), tableController.vacateTable);

export default router;
