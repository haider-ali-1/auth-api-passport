import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { asyncHandler } from '../utils/helpers.js';

export const ensureAuthenticated = asyncHandler(async (req, res, next) => {
  const authHeader =
    req.headers['authorization'] || req.headers['Authorization'];

  const token =
    req.cookies?.accessToken ||
    (authHeader &&
      authHeader?.startsWith('Bearer ') &&
      authHeader?.split(' ')[1]);

  if (!token) throw new createError.Unauthorized('please login');

  // token expired error will be fire from here
  const user = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);

  req.user = user;
  next();
});

export const ensureAuthorized = (roles) => {
  return asyncHandler(async (req, res, next) => {
    const authorized = roles.some((role) => req.user?.role.includes(role));
    if (!authorized)
      throw new createError.Forbidden(
        `you dont have permission to perform this action`
      );
    next();
  });
};
