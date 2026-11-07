import express from 'express';
import { getGamificationBadges } from '../controllers/gamificationController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

// Get user streak metrics, points, and achievement badges
router.get('/badges', getGamificationBadges);

export default router;
