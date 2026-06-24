import { Router } from 'express';
import { z } from 'zod';
import { createPost, getPosts, toggleUpvote, getPostDetails, createComment } from '../controllers/forumController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getPosts);
router.post('/', protect, validate(z.object({ title: z.string().min(8).max(180), body: z.string().min(15).max(5000), category: z.string().min(2) })), createPost);
router.patch('/:id/upvote', protect, toggleUpvote);
router.get('/:id', getPostDetails);
router.post('/:id/comments', protect, validate(z.object({ body: z.string().min(5).max(2000) })), createComment);

export default router;
