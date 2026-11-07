import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../db.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';

export const JWT_SECRET =
  process.env.JWT_SECRET || 'glow-and-go-dev-jwt-secret-do-not-use-in-production';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        message: 'Authentication required. No token provided.',
        status: 401,
      },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isSupabaseConfigured()) {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, skin_profile')
        .eq('id', decoded.id)
        .maybeSingle();

      if (!user || error) {
        return res.status(401).json({
          error: {
            message: 'User no longer exists or token invalid.',
            status: 401,
          },
        });
      }

      req.user = {
        _id: user.id,
        id: user.id,
        email: user.email,
        name: user.name,
        skinProfile: user.skin_profile,
      };
    } else if (isDbConnected()) {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          error: {
            message: 'User no longer exists or token invalid.',
            status: 401,
          },
        });
      }
      req.user = user;
    } else {
      req.user = {
        _id: decoded.id || '507f1f77bcf86cd799439011',
        id: decoded.id || '507f1f77bcf86cd799439011',
        email: decoded.email || 'demo@glow.vn',
        name: decoded.name || 'Tô Huyền Châu',
        skinProfile: decoded.skinProfile || {
          skinType: 'combination',
          concerns: ['oiliness', 'pore', 'dark_spots'],
          goals: ['hydration', 'glow', 'barrier'],
          sensitivityLevel: 'low',
          isOnboarded: true,
        },
      };
    }

    return next();
  } catch (err) {
    return res.status(401).json({
      error: {
        message:
          err.name === 'TokenExpiredError'
            ? 'Token expired. Please login again.'
            : 'Invalid authentication token.',
        status: 401,
      },
    });
  }
}
