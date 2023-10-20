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
    refreshTokens: [{ type: String }],
    emailVerificationToken: { type: String },
    emailVerificationTokenExpireAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetTokenExpireAt: { type: Date },
    // sessions: [sessionSchema],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// query middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.method('compareWithHash', async function (value, field) {
  return await bcrypt.compare(value, this[field]);
});

export const User = model('User', userSchema);
