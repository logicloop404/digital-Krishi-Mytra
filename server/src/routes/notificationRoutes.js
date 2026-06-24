import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getNotifications)
  .patch(markAllAsRead);

router.patch('/:id/read', markAsRead);

export default router;
