import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import {
  REGISTER_METHODS,
  REGISTER_METHOD_ENUM,
  USER_ROLES,
  USER_ROLE_ENUM,
} from '../constants.js';

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
      strict: true,
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
        return this.registerMethod === REGISTER_METHODS.EMAIL_PASSWORD;
      },
      trim: true,
      minLength: [6, 'password must be at least 6 characters long'],
      select: false,
    },
    registerMethod: {
      type: String,
      enum: {
        values: REGISTER_METHOD_ENUM,
        message: `invalid register method {VALUE}`,
      },
      default: REGISTER_METHODS.EMAIL_PASSWORD,
    },
    googleId: {
      type: String,
      required: function () {
        return this.registerMethod === REGISTER_METHODS.GOOGLE;
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
        values: USER_ROLE_ENUM,
        message: `invalid role type {VALUE}`,
      },
      default: [USER_ROLES.USER],
    },
    isVerified: { type: Boolean, default: false },
    refreshTokens: [{ type: String, select: false }],
    emailVerificationToken: { type: String, select: false },
    emailVerificationTokenExpireAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetTokenExpireAt: { type: Date, select: false },
    // sessions: [sessionSchema],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  // if (!this.isModified('password') && !this.isModified('googleId'))
  //   return next();

  if (this.isModified('googleId')) {
    return (this.googleId = await bcrypt.hash(this.googleId, 10));
  } else if (this.isModified('password')) {
    return (this.password = await bcrypt.hash(this.password, 10));
  }
  next();
});

userSchema.method('compareWithHash', async function (value, field) {
  return await bcrypt.compare(value, this[field]);
});

export const User = model('User', userSchema);
