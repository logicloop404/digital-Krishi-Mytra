import { Router } from 'express';
import { z } from 'zod';
import { getCrops, createCrop, updateCrop, deleteCrop } from '../controllers/cropController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const cropSchema = z.object({
  name: z.string().min(2).max(80),
  season: z.string().optional(),
  status: z.enum(['planned', 'sown', 'growing', 'harvested']).default('planned'),
  area: z.coerce.number().nonnegative().optional(),
  healthScore: z.coerce.number().min(0).max(100).optional(),
});

router.use(protect);

router.route('/')
  .get(getCrops)
  .post(validate(cropSchema), createCrop);

router.route('/:id')
  .patch(validate(cropSchema.partial()), updateCrop)
  .delete(deleteCrop);

export default router;
