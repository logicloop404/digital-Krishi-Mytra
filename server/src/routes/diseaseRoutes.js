import { Router } from 'express';
import { detectDisease, getDiseaseReports } from '../controllers/diseaseController.js';
import { protect } from '../middleware/auth.js';
import { singleLeafImage } from '../middleware/upload.js';

const router = Router();

router.post('/detect', protect, singleLeafImage, detectDisease);
router.get('/reports', protect, getDiseaseReports);

export default router;
