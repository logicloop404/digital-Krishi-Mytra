import { Router } from 'express';
import { getAnalytics, listUsers } from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/auth.js';
const router = Router();
router.use(protect, authorize('admin'));
router.get('/analytics', getAnalytics);
router.get('/users', listUsers);
export default router;
