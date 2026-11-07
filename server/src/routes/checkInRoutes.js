import express from 'express';
import {
  createCheckIn,
  getTodayCheckIn,
  getCheckInHistory,
  getCheckInReport,
} from '../controllers/checkInController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createCheckIn);
router.get('/today', getTodayCheckIn);
router.get('/history', getCheckInHistory);
router.get('/report', getCheckInReport);

export default router;

