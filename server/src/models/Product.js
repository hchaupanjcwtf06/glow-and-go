import mongoose from 'mongoose';

export const CATEGORY_STEP_MAP = {
  cleanser: 1,
  toner: 2,
  serum: 3,
  treatment: 4,
  moisturizer: 5,
  sunscreen: 6,
  mask: 7,
  other: 8,
};

export const ALLOWED_CATEGORIES = [
  'cleanser',
  'toner',
  'serum',
  'treatment',
  'moisturizer',
  'sunscreen',
  'mask',
  'other',
];

export const ALLOWED_ROUTINE_TIMES = ['day', 'night', 'both'];

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters long'],
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: {
        values: ALLOWED_CATEGORIES,
        message: 'Invalid product category',
      },
      required: [true, 'Product category is required'],
    },
    routineTime: {
      type: String,
      enum: {
        values: ALLOWED_ROUTINE_TIMES,
        message: 'routineTime must be "day", "night", or "both"',
      },
      default: 'both',
    },
    stepOrder: {
      type: Number,
      default: function () {
        return CATEGORY_STEP_MAP[this.category] || 99;
      },
    },
    openedDate: {
      type: Date,
      default: null,
    },
    paoMonths: {
      type: Number,
      min: [1, 'PAO must be at least 1 month'],
      max: [60, 'PAO cannot exceed 60 months'],
      default: null,
    },
    activeIngredients: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly sort products on shelf by step order
productSchema.index({ userId: 1, stepOrder: 1, createdAt: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;

