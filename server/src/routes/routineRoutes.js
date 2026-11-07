import express from 'express';
import {
  getEnvironment,
  getDailyRoutine,
} from '../controllers/routineController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Allow reading environmental weather data publicly or authenticated
router.get('/environment', getEnvironment);

// Daily routine calculation requires authenticated user for shelf personalization
router.get('/daily', authenticate, getDailyRoutine);

export default router;

