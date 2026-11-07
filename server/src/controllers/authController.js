import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../db.js';
import { JWT_SECRET } from '../middlewares/auth.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const ALLOWED_SKIN_TYPES = ['oily', 'dry', 'combination', 'normal', 'sensitive'];
const ALLOWED_SENSITIVITY = ['low', 'medium', 'high'];

// Default demo account credentials and initial skin profile
export const DEMO_USER = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Tô Huyền Châu',
  email: 'demo@glow.vn',
  skinProfile: {
    skinType: 'combination',
    concerns: ['oiliness', 'pore', 'dark_spots'],
    goals: ['hydration', 'glow', 'barrier'],
    sensitivityLevel: 'low',
    isOnboarded: true,
  },
  createdAt: new Date('2026-03-01T08:00:00.000Z'),
};

let currentDemoUser = { ...DEMO_USER };

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

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Supabase Cloud Database path
    if (isSupabaseConfigured()) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

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

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          name: name.trim(),
          email: normalizedEmail,
          password_hash: hashedPassword,
          skin_profile: {
            skinType: 'normal',
            concerns: [],
            goals: [],
            sensitivityLevel: 'medium',
            isOnboarded: false,
          },
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const user = {
        _id: newUser.id,
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        skinProfile: newUser.skin_profile,
        createdAt: newUser.created_at,
      };

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          name: user.name,
          skinProfile: user.skinProfile,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'Registration successful',
        token,
        user,
      });
    }

    // 2. MongoDB Atlas path
    if (isDbConnected()) {
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
    }

    // 3. Offline in-memory fallback
    const userPayload = {
      _id: '507f1f77bcf86cd799439011',
      name: name.trim(),
      email: normalizedEmail,
      skinProfile: {
        skinType: 'normal',
        concerns: [],
        goals: [],
        sensitivityLevel: 'medium',
        isOnboarded: false,
      },
      createdAt: new Date(),
    };
    currentDemoUser = userPayload;

    const token = jwt.sign(
      {
        id: userPayload._id,
        email: userPayload.email,
        name: userPayload.name,
        skinProfile: userPayload.skinProfile,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful (chế độ demo offline)',
      token,
      user: userPayload,
      isDemo: true,
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

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Supabase Cloud Database path
    if (isSupabaseConfigured()) {
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (!userRecord || userError) {
        return res.status(401).json({
          error: {
            message: 'Invalid email or password.',
            status: 401,
          },
        });
      }

      const isMatch = await bcrypt.compare(password, userRecord.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          error: {
            message: 'Invalid email or password.',
            status: 401,
          },
        });
      }

      const user = {
        _id: userRecord.id,
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        skinProfile: userRecord.skin_profile,
        createdAt: userRecord.created_at,
      };

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          name: user.name,
          skinProfile: user.skinProfile,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        user,
      });
    }

    // 2. MongoDB Atlas path
    if (isDbConnected()) {
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
    }

    // 3. Instant demo login or offline login without requiring database
    const userPayload = {
      ...currentDemoUser,
      email: normalizedEmail === 'demo@glow.vn' ? 'demo@glow.vn' : normalizedEmail,
      name:
        normalizedEmail === 'demo@glow.vn'
          ? currentDemoUser.name
          : normalizedEmail.split('@')[0] || 'Tô Huyền Châu',
    };

    const token = jwt.sign(
      {
        id: userPayload._id,
        email: userPayload.email,
        name: userPayload.name,
        skinProfile: userPayload.skinProfile,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful (tài khoản demo offline)',
      token,
      user: userPayload,
      isDemo: true,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    if (isSupabaseConfigured()) {
      const { data: userRecord } = await supabase
        .from('users')
        .select('id, name, email, skin_profile, created_at')
        .eq('id', req.user._id || req.user.id)
        .maybeSingle();

      if (userRecord) {
        return res.status(200).json({
          user: {
            _id: userRecord.id,
            id: userRecord.id,
            name: userRecord.name,
            email: userRecord.email,
            skinProfile: userRecord.skin_profile,
            createdAt: userRecord.created_at,
          },
        });
      }
    }

    if (isDbConnected()) {
      return res.status(200).json({
        user: req.user,
      });
    }

    return res.status(200).json({
      user: {
        ...currentDemoUser,
        ...(req.user || {}),
        skinProfile: req.user?.skinProfile || currentDemoUser.skinProfile,
      },
      isDemo: true,
    });
  } catch (err) {
    return next(err);
  }
}

export async function updateSkinProfile(req, res, next) {
  try {
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

    // 1. Supabase Cloud Database path
    if (isSupabaseConfigured()) {
      const updatedProfile = {
        skinType: skinType || req.user.skinProfile?.skinType || 'normal',
        concerns: Array.isArray(concerns)
          ? concerns
          : req.user.skinProfile?.concerns || [],
        goals: Array.isArray(goals)
          ? goals
          : req.user.skinProfile?.goals || [],
        sensitivityLevel:
          sensitivityLevel ||
          req.user.skinProfile?.sensitivityLevel ||
          'medium',
        isOnboarded: true,
      };

      const { data: updatedRecord, error: updateErr } = await supabase
        .from('users')
        .update({
          skin_profile: updatedProfile,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.user._id || req.user.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      return res.status(200).json({
        message: 'Skin profile updated successfully',
        user: {
          _id: updatedRecord.id,
          id: updatedRecord.id,
          name: updatedRecord.name,
          email: updatedRecord.email,
          skinProfile: updatedRecord.skin_profile,
        },
      });
    }

    // 2. MongoDB Atlas path
    if (isDbConnected()) {
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
        concerns: Array.isArray(concerns)
          ? concerns
          : user.skinProfile?.concerns || [],
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
    }

    // 3. Offline in-memory fallback
    currentDemoUser.skinProfile = {
      skinType: skinType || currentDemoUser.skinProfile?.skinType || 'normal',
      concerns: Array.isArray(concerns)
        ? concerns
        : currentDemoUser.skinProfile?.concerns || [],
      goals: Array.isArray(goals)
        ? goals
        : currentDemoUser.skinProfile?.goals || [],
      sensitivityLevel:
        sensitivityLevel ||
        currentDemoUser.skinProfile?.sensitivityLevel ||
        'medium',
      isOnboarded: true,
    };

    return res.status(200).json({
      message: 'Skin profile updated successfully (chế độ demo offline)',
      user: currentDemoUser,
      isDemo: true,
    });
  } catch (err) {
    return next(err);
  }
}
