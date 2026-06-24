import { Router } from 'express';
import { z } from 'zod';
import { createRecommendation, getRecommendations, saveRecommendation } from '../controllers/recommendationController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.route('/')
  .get(protect, getRecommendations)
  .post(protect, validate(z.object({ soilType: z.string().min(2), landArea: z.coerce.number().positive(), waterAvailability: z.enum(['Low', 'Moderate', 'High']), season: z.enum(['Kharif', 'Rabi', 'Zaid']), region: z.string().min(2) })), createRecommendation);

router.patch('/:id/save', protect, saveRecommendation);

export default router;
