import createError from 'http-errors';
import { asyncHandler } from '../utils/helpers.js';
import { User } from '../models/user.model.js';

export const notFoundMiddleware = asyncHandler((req, res, next) => {
  throw new createError.NotFound(
    `cannot find ${req.get('host')}${req.originalUrl} on the server`
  );
});
