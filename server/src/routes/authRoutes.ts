import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, registerValidator, loginValidator } from '../middleware/validators';

const router = Router();

router.post('/register', validate(registerValidator), asyncHandler(register));
router.post('/login', validate(loginValidator), asyncHandler(login));
router.get('/profile', authenticate, asyncHandler(getProfile));

export default router;