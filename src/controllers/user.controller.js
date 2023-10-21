import createError from 'http-errors';
import { StatusCodes } from 'http-status-codes';

import { User } from '../models/user.model.js';

import { asyncHandler } from '../utils/helpers.js';
import { USER_ROLES } from '../constants.js';

// @ Get All Users
// @ GET /api/v1/users

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ role: { $ne: USER_ROLES.ADMIN } });
  res.status(StatusCodes.OK).json({ status: 'success', data: { users } });
});

// @ Get Single User
// @ GET /api/v1/users/:userId

export const getSingleUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) throw new createError.NotFound(`invalid user id`);

  const checkIfUserIsAdmin = (user, userId) => {
    const { _id, role } = user;
    if (_id === userId) return;
    if (role === USER_ROLES.ADMIN) return;
    throw new createError.Unauthorized(
      'you dont have permission to perform this action'
    );
  };

  res.status(StatusCodes.OK).json({ status: 'success', data: { user } });
});

// @ Update User Data
// @ PATCH /api/v1/users/profile

export const updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const { name } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name },
    { new: true, runValidators: true }
  );

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', data: { user: updatedUser } });
});

// @ Delete User
// @ Delete /api/v1/users/:userId

export const deleteUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) throw new createError.NotFound('invalid user id');

  await user.deleteOne();
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'user deleted successfully' });
});

// @ Show Current User
// @ GET /api/v1/users/profile

export const getCurrentUser = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const user = await User.findById(_id);
  if (!user) throw new createError.NotFound('invalid user id');
  res.status(StatusCodes.OK).json({ status: 'success', data: { user } });
});

// @ Change User Role
// @ PATCH /api/v1/users/:userId/role

export const changeUserRole = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { role } = req.body;
  const user = await User.findById(userId);
  if (!user) throw new createError.NotFound('invalid user id');

  if (user?.role.includes(role))
    throw new createError.BadRequest(`user already has this role`);

  user.role = [...user.role, role];
  await user.save();
  res.json({ status: 'success', message: 'role updated' });
});
