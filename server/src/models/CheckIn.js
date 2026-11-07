import mongoose from 'mongoose';

export const ALLOWED_FEELINGS = [
  'ẩm mượt',
  'dịu da',
  'đổ dầu nhờn',
  'khô căng',
  'đỏ rát',
  'châm chích',
  'căng bóng rạng rỡ',
  'bình thường',
];

const checkInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    routineType: {
      type: String,
      enum: ['day', 'night', 'both'],
      default: 'day',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feelings: {
      type: [String],
      default: [],
    },
    completedStepsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    environmentalContext: {
      city: { type: String, default: 'TP. Hồ Chí Minh' },
      temperature: { type: Number, default: null },
      humidity: { type: Number, default: null },
      uvIndex: { type: Number, default: null },
      aqi: { type: Number, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find check-in by user and date
checkInSchema.index({ userId: 1, date: 1, routineType: 1 });

const CheckIn =
  mongoose.models.CheckIn || mongoose.model('CheckIn', checkInSchema);

export default CheckIn;

