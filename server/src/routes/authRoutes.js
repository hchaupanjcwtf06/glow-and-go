import express from 'express';
import {
  register,
  login,
  getMe,
  updateSkinProfile,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/skin-profile', authenticate, updateSkinProfile);

export default router;

