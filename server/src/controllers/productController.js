import Product, {
  ALLOWED_CATEGORIES,
  ALLOWED_ROUTINE_TIMES,
  CATEGORY_STEP_MAP,
} from '../models/Product.js';
import { isDbConnected } from '../db.js';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { suggestProductWithGemini } from '../services/geminiService.js';
import { DEMO_SHELF_PRODUCTS } from '../services/routineEngine.js';

// In-memory fallback product shelf for offline / disconnected DB mode
let inMemoryProducts = DEMO_SHELF_PRODUCTS.map((p) => ({
  ...p,
  userId: '507f1f77bcf86cd799439011',
  createdAt: new Date(),
}));

export async function getProducts(req, res, next) {
  try {
    // 1. Supabase Cloud Database path
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('products')
        .select('*')
        .eq('user_id', req.user._id || req.user.id);

      if (req.query.routineTime === 'day') {
        query = query.in('routine_time', ['day', 'both']);
      } else if (req.query.routineTime === 'night') {
        query = query.in('routine_time', ['night', 'both']);
      } else if (req.query.routineTime) {
        query = query.eq('routine_time', req.query.routineTime);
      }

      if (req.query.category && ALLOWED_CATEGORIES.includes(req.query.category)) {
        query = query.eq('category', req.query.category);
      }

      const { data: dbProducts, error } = await query.order('step_order', {
        ascending: true,
      });
      if (error && error.code === 'PGRST205') {
        console.warn(
          '⚠️ [Supabase] Bảng public.products chưa tồn tại. Đang dùng tủ mỹ phẩm mẫu offline.'
        );
      } else if (!error) {
        const products = (dbProducts || []).map((p) => ({
          _id: p.id,
          id: p.id,
          userId: p.user_id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          routineTime: p.routine_time,
          stepOrder: p.step_order,
          openedDate: p.opened_date,
          paoMonths: p.pao_months,
          activeIngredients: p.active_ingredients || [],
          notes: p.notes,
          createdAt: p.created_at,
        }));

        return res.status(200).json({
          count: products.length,
          products,
        });
      }
    }

    // 2. MongoDB Atlas path
    if (isDbConnected()) {
      const filter = { userId: req.user._id };

      if (req.query.routineTime === 'day') {
        filter.routineTime = { $in: ['day', 'both'] };
      } else if (req.query.routineTime === 'night') {
        filter.routineTime = { $in: ['night', 'both'] };
      } else if (req.query.routineTime) {
        filter.routineTime = req.query.routineTime;
      }

      if (req.query.category && ALLOWED_CATEGORIES.includes(req.query.category)) {
        filter.category = req.query.category;
      }

      const products = await Product.find(filter).sort({
        stepOrder: 1,
        createdAt: 1,
      });

      return res.status(200).json({
        count: products.length,
        products,
      });
    }

    // 3. Offline in-memory fallback
    let filtered = [...inMemoryProducts];

    if (req.query.routineTime === 'day') {
      filtered = filtered.filter(
        (p) => p.routineTime === 'day' || p.routineTime === 'both'
      );
    } else if (req.query.routineTime === 'night') {
      filtered = filtered.filter(
        (p) => p.routineTime === 'night' || p.routineTime === 'both'
      );
    } else if (req.query.routineTime) {
      filtered = filtered.filter((p) => p.routineTime === req.query.routineTime);
    }

    if (req.query.category && ALLOWED_CATEGORIES.includes(req.query.category)) {
      filtered = filtered.filter((p) => p.category === req.query.category);
    }

    filtered.sort((a, b) => (a.stepOrder || 99) - (b.stepOrder || 99));

    return res.status(200).json({
      count: filtered.length,
      products: filtered,
      isDemo: true,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getProductById(req, res, next) {
  try {
    // 1. Supabase Cloud Database path
    if (isSupabaseConfigured()) {
      const { data: p, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', req.params.id)
        .eq('user_id', req.user._id || req.user.id)
        .maybeSingle();

      if (!p || error) {
        return res.status(404).json({
          error: {
            message: 'Product not found on your shelf.',
            status: 404,
          },
        });
      }

      const product = {
        _id: p.id,
        id: p.id,
        userId: p.user_id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        routineTime: p.routine_time,
        stepOrder: p.step_order,
        openedDate: p.opened_date,
        paoMonths: p.pao_months,
        activeIngredients: p.active_ingredients || [],
        notes: p.notes,
        createdAt: p.created_at,
      };

      return res.status(200).json({ product });
    }

    // 2. MongoDB Atlas path
    if (isDbConnected()) {
      const product = await Product.findById(req.params.id);

      if (!product || product.userId.toString() !== req.user._id.toString()) {
        return res.status(404).json({
          error: {
            message: 'Product not found on your shelf.',
            status: 404,
          },
        });
      }

      return res.status(200).json({ product });
    }

    // 3. Offline in-memory fallback
    const prod = inMemoryProducts.find((p) => p._id === req.params.id);
    if (!prod) {
      return res.status(404).json({
        error: {
          message: 'Product not found on your shelf.',
          status: 404,
        },
      });
    }
    return res.status(200).json({ product: prod, isDemo: true });
  } catch (err) {
    return next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const {
      name,
      brand,
      category,
      routineTime,
      stepOrder,
      openedDate,
      paoMonths,
      activeIngredients,
      notes,
    } = req.body || {};

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        error: {
          message: 'Product name is required (at least 2 characters).',
          status: 400,
        },
      });
    }

    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: {
          message: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
          status: 400,
        },
      });
    }

    if (routineTime && !ALLOWED_ROUTINE_TIMES.includes(routineTime)) {
      return res.status(400).json({
        error: {
          message: `Invalid routineTime. Must be "day", "night", or "both".`,
          status: 400,
        },
      });
    }

    const resolvedStepOrder =
      typeof stepOrder === 'number'
        ? stepOrder
        : CATEGORY_STEP_MAP[category] || 99;

    // 1. Supabase Cloud Database path
    if (isSupabaseConfigured()) {
      const { data: p, error } = await supabase
        .from('products')
        .insert({
          user_id: req.user._id || req.user.id,
          name: name.trim(),
          brand: brand ? brand.trim() : '',
          category,
          routine_time: routineTime || 'both',
          step_order: resolvedStepOrder,
          opened_date: openedDate ? new Date(openedDate).toISOString() : null,
          pao_months: typeof paoMonths === 'number' ? paoMonths : 12,
          active_ingredients: Array.isArray(activeIngredients)
            ? activeIngredients
            : [],
          notes: notes ? notes.trim() : '',
        })
        .select()
        .single();

      if (error) throw error;

      const product = {
        _id: p.id,
        id: p.id,
        userId: p.user_id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        routineTime: p.routine_time,
        stepOrder: p.step_order,
        openedDate: p.opened_date,
        paoMonths: p.pao_months,
        activeIngredients: p.active_ingredients || [],
        notes: p.notes,
        createdAt: p.created_at,
      };

      return res.status(201).json({
        message: 'Product added to shelf successfully',
        product,
      });
    }

    // 2. MongoDB Atlas path
    if (isDbConnected()) {
      const product = await Product.create({
        userId: req.user._id,
        name: name.trim(),
        brand: brand ? brand.trim() : '',
        category,
        routineTime: routineTime || 'both',
        stepOrder: resolvedStepOrder,
        openedDate: openedDate ? new Date(openedDate) : null,
        paoMonths: typeof paoMonths === 'number' ? paoMonths : null,
        activeIngredients: Array.isArray(activeIngredients)
          ? activeIngredients
          : [],
        notes: notes ? notes.trim() : '',
      });

      return res.status(201).json({
        message: 'Product added to shelf successfully',
        product,
      });
    }

    // 3. Offline in-memory fallback
    const newProd = {
      _id: 'prod-' + Date.now(),
      userId: req.user._id,
      name: name.trim(),
      brand: brand ? brand.trim() : '',
      category,
      routineTime: routineTime || 'both',
      stepOrder: resolvedStepOrder,
      openedDate: openedDate ? new Date(openedDate) : null,
      paoMonths: typeof paoMonths === 'number' ? paoMonths : 12,
      activeIngredients: Array.isArray(activeIngredients)
        ? activeIngredients
        : [],
      notes: notes ? notes.trim() : '',
      createdAt: new Date(),
    };
    inMemoryProducts.push(newProd);

    return res.status(201).json({
      message: 'Product added to shelf successfully (bộ nhớ tạm)',
      product: newProd,
      isDemo: true,
    });
  } catch (err) {
    return next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const {
      name,
      brand,
      category,
      routineTime,
      stepOrder,
      openedDate,
      paoMonths,
      activeIngredients,
      notes,
    } = req.body || {};

    if (name && name.trim().length < 2) {
      return res.status(400).json({
        error: {
          message: 'Product name must be at least 2 characters.',
          status: 400,
        },
      });
    }

    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: {
          message: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
          status: 400,
        },
      });
    }

    if (routineTime && !ALLOWED_ROUTINE_TIMES.includes(routineTime)) {
      return res.status(400).json({
        error: {
          message: `Invalid routineTime. Must be "day", "night", or "both".`,
          status: 400,
        },
      });
    }

    // 1. Supabase Cloud Database path
    if (isSupabaseConfigured()) {
      const updatePayload = {};
      if (name) updatePayload.name = name.trim();
      if (category) {
        updatePayload.category = category;
        if (typeof stepOrder !== 'number') {
          updatePayload.step_order = CATEGORY_STEP_MAP[category] || 99;
        }
      }
      if (brand !== undefined) updatePayload.brand = brand ? brand.trim() : '';
      if (routineTime) updatePayload.routine_time = routineTime;
      if (typeof stepOrder === 'number') updatePayload.step_order = stepOrder;
      if (openedDate !== undefined)
        updatePayload.opened_date = openedDate
          ? new Date(openedDate).toISOString()
          : null;
      if (paoMonths !== undefined) updatePayload.pao_months = paoMonths;
      if (Array.isArray(activeIngredients))
        updatePayload.active_ingredients = activeIngredients;
      if (notes !== undefined) updatePayload.notes = notes ? notes.trim() : '';
      updatePayload.updated_at = new Date().toISOString();

      const { data: p, error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', req.params.id)
        .eq('user_id', req.user._id || req.user.id)
        .select()
        .maybeSingle();

      if (!p || error) {
        return res.status(404).json({
          error: {
            message: 'Product not found on your shelf.',
            status: 404,
          },
        });
      }

      const product = {
        _id: p.id,
        id: p.id,
        userId: p.user_id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        routineTime: p.routine_time,
        stepOrder: p.step_order,
        openedDate: p.opened_date,
        paoMonths: p.pao_months,
        activeIngredients: p.active_ingredients || [],
        notes: p.notes,
        createdAt: p.created_at,
      };

      return res.status(200).json({
        message: 'Product updated successfully',
        product,
      });
    }

    // 2. MongoDB Atlas path
    if (isDbConnected()) {
      const product = await Product.findById(req.params.id);

      if (!product || product.userId.toString() !== req.user._id.toString()) {
        return res.status(404).json({
          error: {
            message: 'Product not found on your shelf.',
            status: 404,
          },
        });
      }

      if (name) product.name = name.trim();
      if (category) {
        product.category = category;
        if (typeof stepOrder !== 'number') {
          product.stepOrder = CATEGORY_STEP_MAP[category] || product.stepOrder;
        }
      }
      if (brand !== undefined) product.brand = brand ? brand.trim() : '';
      if (routineTime) product.routineTime = routineTime;
      if (typeof stepOrder === 'number') product.stepOrder = stepOrder;
      if (openedDate !== undefined)
        product.openedDate = openedDate ? new Date(openedDate) : null;
      if (paoMonths !== undefined) product.paoMonths = paoMonths;
      if (Array.isArray(activeIngredients))
        product.activeIngredients = activeIngredients;
      if (notes !== undefined) product.notes = notes ? notes.trim() : '';

      await product.save();

      return res.status(200).json({
        message: 'Product updated successfully',
        product,
      });
    }

    // 3. Offline in-memory fallback
    const prodIndex = inMemoryProducts.findIndex((p) => p._id === req.params.id);
    if (prodIndex === -1) {
      return res.status(404).json({
        error: {
          message: 'Product not found on your shelf.',
          status: 404,
        },
      });
    }

    const prod = { ...inMemoryProducts[prodIndex] };

    if (name) prod.name = name.trim();
    if (category) {
      prod.category = category;
      if (typeof stepOrder !== 'number') {
        prod.stepOrder = CATEGORY_STEP_MAP[category] || prod.stepOrder;
      }
    }
    if (brand !== undefined) prod.brand = brand ? brand.trim() : '';
    if (routineTime) prod.routineTime = routineTime;
    if (typeof stepOrder === 'number') prod.stepOrder = stepOrder;
    if (openedDate !== undefined)
      prod.openedDate = openedDate ? new Date(openedDate) : null;
    if (paoMonths !== undefined) prod.paoMonths = paoMonths;
    if (Array.isArray(activeIngredients))
      prod.activeIngredients = activeIngredients;
    if (notes !== undefined) prod.notes = notes ? notes.trim() : '';

    inMemoryProducts[prodIndex] = prod;

    return res.status(200).json({
      message: 'Product updated successfully (bộ nhớ tạm)',
      product: prod,
      isDemo: true,
    });
  } catch (err) {
    return next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    // 1. Supabase Cloud Database path
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.user._id || req.user.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({
          error: {
            message: 'Product not found on your shelf.',
            status: 404,
          },
        });
      }

      return res.status(200).json({
        message: 'Product removed from shelf successfully',
      });
    }

    // 2. MongoDB Atlas path
    if (isDbConnected()) {
      const product = await Product.findById(req.params.id);

      if (!product || product.userId.toString() !== req.user._id.toString()) {
        return res.status(404).json({
          error: {
            message: 'Product not found on your shelf.',
            status: 404,
          },
        });
      }

      await Product.deleteOne({ _id: req.params.id });

      return res.status(200).json({
        message: 'Product removed from shelf successfully',
      });
    }

    // 3. Offline in-memory fallback
    const prodIndex = inMemoryProducts.findIndex((p) => p._id === req.params.id);
    if (prodIndex === -1) {
      return res.status(404).json({
        error: {
          message: 'Product not found on your shelf.',
          status: 404,
        },
      });
    }

    inMemoryProducts.splice(prodIndex, 1);

    return res.status(200).json({
      message: 'Product removed from shelf successfully (bộ nhớ tạm)',
      isDemo: true,
    });
  } catch (err) {
    return next(err);
  }
}

export async function suggestProduct(req, res, next) {
  try {
    const { query } = req.body || {};

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return res.status(400).json({
        error: {
          message: 'Tên hoặc từ khóa sản phẩm phải có ít nhất 2 ký tự.',
          status: 400,
        },
      });
    }

    const draft = await suggestProductWithGemini(query);

    return res.status(200).json({
      message: 'Product draft generated successfully',
      draft,
    });
  } catch (err) {
    return next(err);
  }
}
