
import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { body } from 'express-validator';
import { runValidation } from '../middleware/validate.middleware';

const router = Router();

// Authentication routes
router.post(
	'/signup',
	body('name').notEmpty().withMessage('name is required'),
	body('email').isEmail().withMessage('valid email is required'),
	body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
	runValidation,
	authController.signup
);

router.post('/login', body('email').isEmail(), body('password').notEmpty(), runValidation, authController.login);

// Protected routes (require authentication)
// router.use(authController.protect);

// Example of a protected route
// router.get('/me', userController.getMe, userController.getUser);

export default router;
