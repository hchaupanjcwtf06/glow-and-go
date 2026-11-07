import mongoose from 'mongoose';

const skinProfileSchema = new mongoose.Schema(
  {
    skinType: {
      type: String,
      enum: ['oily', 'dry', 'combination', 'normal', 'sensitive'],
      default: 'normal',
    },
    concerns: {
      type: [String],
      default: [],
    },
    goals: {
      type: [String],
      default: [],
    },
    sensitivityLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    skinProfile: {
      type: skinProfileSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;

