import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middlewares/auth.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const ALLOWED_SKIN_TYPES = ['oily', 'dry', 'combination', 'normal', 'sensitive'];
const ALLOWED_SENSITIVITY = ['low', 'medium', 'high'];

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        error: {
          message: 'Tên phải có ít nhất 2 ký tự.',
          status: 400,
        },
      });
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        error: {
          message: 'Email không đúng định dạng.',
          status: 400,
        },
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: {
          message: 'Mật khẩu phải có ít nhất 6 ký tự.',
          status: 400,
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Supabase Cloud Database
    if (isSupabaseConfigured()) {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (checkError?.code === 'PGRST205') {
        return res.status(503).json({
          error: {
            message:
              'Bảng public.users chưa tồn tại trên Supabase. Vui lòng chạy file server/src/db/supabase-schema.sql trong Supabase SQL Editor.',
            status: 503,
          },
        });
      }

      if (existingUser) {
        return res.status(400).json({
          error: {
            message: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn email khác.',
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

      if (insertError) {
        if (insertError.code === '42501') {
          return res.status(403).json({
            error: {
              message:
                'Supabase chặn quyền thêm dữ liệu (Row-Level Security). Vui lòng chạy lệnh SQL cấp quyền hoặc điền service_role key.',
              status: 403,
            },
          });
        }
        throw insertError;
      }

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
        message: 'Đăng ký tài khoản thành công',
        token,
        user,
      });
    }

    // 2. Offline fallback if Supabase credentials are missing
    return res.status(503).json({
      error: {
        message:
          'Dịch vụ cơ sở dữ liệu chưa sẵn sàng. Vui lòng kiểm tra SUPABASE_URL trong server/.env',
        status: 503,
      },
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
          message: 'Vui lòng nhập đầy đủ email và mật khẩu.',
          status: 400,
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Supabase Cloud Database
    if (isSupabaseConfigured()) {
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (userError?.code === 'PGRST205') {
        return res.status(503).json({
          error: {
            message:
              'Bảng public.users chưa tồn tại trên Supabase. Vui lòng chạy file server/src/db/supabase-schema.sql trong Supabase SQL Editor.',
            status: 503,
          },
        });
      }

      if (!userRecord || userError) {
        return res.status(401).json({
          error: {
            message: 'Email hoặc mật khẩu không chính xác.',
            status: 401,
          },
        });
      }

      const isMatch = await bcrypt.compare(password, userRecord.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          error: {
            message: 'Email hoặc mật khẩu không chính xác.',
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
        message: 'Đăng nhập thành công',
        token,
        user,
      });
    }

    // 2. Offline fallback
    return res.status(503).json({
      error: {
        message:
          'Dịch vụ cơ sở dữ liệu chưa sẵn sàng. Vui lòng kiểm tra SUPABASE_URL trong server/.env',
        status: 503,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    if (isSupabaseConfigured()) {
      const { data: userRecord, error: getMeErr } = await supabase
        .from('users')
        .select('id, name, email, skin_profile, created_at')
        .eq('id', req.user._id || req.user.id)
        .maybeSingle();

      if (userRecord && !getMeErr) {
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

    return res.status(200).json({
      user: req.user,
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
        .maybeSingle();

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

    return res.status(503).json({
      error: {
        message:
          'Database is currently unavailable. Please verify SUPABASE_URL configuration.',
        status: 503,
      },
    });
  } catch (err) {
    return next(err);
  }
}
