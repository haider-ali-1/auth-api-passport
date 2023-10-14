import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import { SignUpProviders, UserRoles } from '../constants.js';

// const sessionSchema = new Schema({
//   refreshToken: { type: String, required: true },
//   device: { type: String, required: true },
//   location: { type: String, required: true },
//   ipAddress: { type: String, required: true },
// });

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === SignUpProviders.CUSTOM;
      },
      minLength: [6, 'password must be at least 6 characters long'],
      select: false,
    },
    provider: {
      type: String,
      enum: Object.values(SignUpProviders),
      default: SignUpProviders.CUSTOM,
    },
    googleId: {
      type: String,
      required: function () {
        return this.provider === SignUpProviders.GOOGLE;
      },
      unique: true,
      select: false,
    },
    profileImage: {
      type: String,
    },
    role: {
      type: [String],
      enum: {
        values: Object.values(UserRoles),
        message: `{VALUE} is not supported`,
      },
      default: [UserRoles.USER],
    },
    isVerified: { type: Boolean, default: false },
    // sessions: [sessionSchema],
    refreshToken: { type: String, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationTokenExpireAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetTokenExpireAt: { type: Date, select: false },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.method('compareWithHash', async function (value, field) {
  return await bcrypt.compare(value, this[field]);
  console.log('called');
});

export const User = model('User', userSchema);
