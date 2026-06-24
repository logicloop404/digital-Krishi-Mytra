import { Router } from 'express';
import { z } from 'zod';
import { forgotPassword, getMe, login, register, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
const router = Router(); const registerSchema = z.object({ name: z.string().min(2).max(80), email: z.string().email(), password: z.string().min(8), phone: z.string().optional(), region: z.string().optional(), landArea: z.number().min(0).optional(), soilType: z.string().optional() }); const credentials = z.object({ email: z.string().email(), password: z.string().min(8) });
router.post('/register', validate(registerSchema), register); router.post('/login', validate(credentials), login); router.get('/me', protect, getMe); router.post('/forgot-password', validate(z.object({ email: z.string().email() })), forgotPassword); router.patch('/reset-password/:token', validate(z.object({ password: z.string().min(8) })), resetPassword);
export default router;
