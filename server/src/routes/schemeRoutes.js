import { Router } from 'express';
import { getSchemes, toggleBookmark, getBookmarkedSchemes } from '../controllers/schemeController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getSchemes);
router.get('/bookmarked', protect, getBookmarkedSchemes);
router.post('/:id/bookmark', protect, toggleBookmark);

export default router;
