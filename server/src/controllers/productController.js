import Product, {
  ALLOWED_CATEGORIES,
  ALLOWED_ROUTINE_TIMES,
  CATEGORY_STEP_MAP,
} from '../models/Product.js';
import { isDbConnected } from '../db.js';
import { suggestProductWithGemini } from '../services/geminiService.js';

export async function getProducts(req, res, next) {
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
  } catch (err) {
    return next(err);
  }
}

export async function getProductById(req, res, next) {
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
  } catch (err) {
    return next(err);
  }
}

export async function createProduct(req, res, next) {
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
  } catch (err) {
    return next(err);
  }
}

export async function updateProduct(req, res, next) {
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

    const product = await Product.findById(req.params.id);

    if (!product || product.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        error: {
          message: 'Product not found on your shelf.',
          status: 404,
        },
      });
    }

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

    if (name) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          error: {
            message: 'Product name must be at least 2 characters.',
            status: 400,
          },
        });
      }
      product.name = name.trim();
    }

    if (category) {
      if (!ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({
          error: {
            message: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
            status: 400,
          },
        });
      }
      product.category = category;
      if (typeof stepOrder !== 'number') {
        product.stepOrder = CATEGORY_STEP_MAP[category] || product.stepOrder;
      }
    }

    if (brand !== undefined) product.brand = brand ? brand.trim() : '';
    if (routineTime) {
      if (!ALLOWED_ROUTINE_TIMES.includes(routineTime)) {
        return res.status(400).json({
          error: {
            message: `Invalid routineTime. Must be "day", "night", or "both".`,
            status: 400,
          },
        });
      }
      product.routineTime = routineTime;
    }
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
  } catch (err) {
    return next(err);
  }
}

export async function deleteProduct(req, res, next) {
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


