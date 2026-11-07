import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../db.js';
import { JWT_SECRET } from '../middlewares/auth.js';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const ALLOWED_SKIN_TYPES = ['oily', 'dry', 'combination', 'normal', 'sensitive'];
const ALLOWED_SENSITIVITY = ['low', 'medium', 'high'];

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        error: {
          message: 'Name is required and must be at least 2 characters long.',
          status: 400,
        },
      });
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        error: {
          message: 'A valid email address is required.',
          status: 400,
        },
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: {
          message: 'Password must be at least 6 characters long.',
          status: 400,
        },
      });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        error: {
          message:
            'Database is currently unavailable. Please verify MONGODB_URI configuration.',
          status: 503,
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        error: {
          message: 'An account with this email address already exists.',
          status: 400,
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user,
    });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: {
          message: 'Email and password are required.',
          status: 400,
        },
      });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        error: {
          message:
            'Database is currently unavailable. Please verify MONGODB_URI configuration.',
          status: 503,
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password.',
          status: 401,
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password.',
          status: 401,
        },
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (err) {
    return next(err);
  }
}

export function getMe(req, res) {
  return res.status(200).json({
    user: req.user,
  });
}

export async function updateSkinProfile(req, res, next) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        error: {
          message:
            'Database is currently unavailable. Please verify MONGODB_URI configuration.',
          status: 503,
        },
      });
    }

    const { skinType, concerns, goals, sensitivityLevel } = req.body || {};

    if (skinType && !ALLOWED_SKIN_TYPES.includes(skinType)) {
      return res.status(400).json({
        error: {
          message: `Invalid skinType. Must be one of: ${ALLOWED_SKIN_TYPES.join(', ')}`,
          status: 400,
        },
      });
    }

    if (sensitivityLevel && !ALLOWED_SENSITIVITY.includes(sensitivityLevel)) {
      return res.status(400).json({
        error: {
          message: `Invalid sensitivityLevel. Must be one of: ${ALLOWED_SENSITIVITY.join(', ')}`,
          status: 400,
        },
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User account not found.',
          status: 404,
        },
      });
    }

    user.skinProfile = {
      skinType: skinType || user.skinProfile?.skinType || 'normal',
      concerns: Array.isArray(concerns) ? concerns : user.skinProfile?.concerns || [],
      goals: Array.isArray(goals) ? goals : user.skinProfile?.goals || [],
      sensitivityLevel:
        sensitivityLevel || user.skinProfile?.sensitivityLevel || 'medium',
      isOnboarded: true,
    };

    await user.save();

    return res.status(200).json({
      message: 'Skin profile updated successfully',
      user,
    });
  } catch (err) {
    return next(err);
  }
}

