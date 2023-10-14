import { StatusCodes } from 'http-status-codes';
import { User } from '../models/user.model.js';
import {
  asyncHandler,
  attachTokenToCookies,
  generateAccessAndRefreshTokens,
} from '../utils/helpers.js';
import createError from 'http-errors';

// @ DESC  refresh the access token
// @ GET   /api/v1/users/refresh-token
// @ ROUTE Protected

export const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.jwt || req.body.refreshToken;
  if (!refreshToken) {
    throw new createError.Unauthorized('please login');
  }

  const user = await User.findOne({ refreshToken });
  if (!user) throw new createError.Unauthorized('unauthorized request');

  const { accessToken } = generateAccessAndRefreshTokens(user);
  res.status(StatusCodes.OK).json({ accessToken });
});

// @ Get All Users
// @ GET /api/v1/users

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});
  res.status(StatusCodes.OK).json({ status: 'success', data: { users } });
});

// @ Get Single User
// @ GET /api/v1/users/:userId

export const getSingleUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) throw new createError.NotFound(`invalid id`);
  res.status(StatusCodes.OK).json({ status: 'success', data: { user } });
});

// @ Delete User
// @ Delete /api/v1/users/:userId

export const deleteUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  await User.findByIdAndDelete(userId);
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', data: { user: updatedUser } });
});

// @ Show Current User
// @ GET /api/v1/users/profile

export const getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user?._id);
  res.status(StatusCodes.OK).json({ status: 'success', data: { user } });
});

// @ Update User Data
// @ PATCH /api/v1/users/profile

export const updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const { name, email } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true, runValidators: true }
  );

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', data: { user: updatedUser } });
});
