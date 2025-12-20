import { Router } from 'express';
import * as tableController from '../controllers/table.controller';
import * as authController from '../controllers/auth.controller';
import { body } from 'express-validator';
import { runValidation } from '../middleware/validate.middleware';

const router = Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Routes for table management
router
  .route('/')
  .get(tableController.getAllTables)
  .post(
    authController.restrictTo('manager', 'admin'),
    body('table_number').isInt().withMessage('table_number is required and must be an integer'),
    body('capacity').isInt({ min: 1 }).withMessage('capacity is required and must be >= 1'),
    runValidation,
    tableController.createTable
  );

// Get available tables within a time range
router.get('/available', tableController.getAvailableTables);

router
  .route('/:id')
  .get(tableController.getTable)
  .patch(
    authController.restrictTo('manager', 'admin'),
    tableController.updateTable
  )
  .delete(
    authController.restrictTo('manager', 'admin'),
    tableController.deleteTable
  );

export default router;
