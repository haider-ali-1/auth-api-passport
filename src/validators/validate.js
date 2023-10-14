import { validationResult } from 'express-validator';
import { asyncHandler } from '../utils/helpers.js';
import createError from 'http-errors';

export const validate = (validations) => {
  const errorHandler = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const modifiedErrors = errors.array().map((err) => {
      return { [err.path]: err.msg };
    });

    throw new createError(400, 'invalid input data', {
      modifiedErrors,
    });
  });
  return [validations, errorHandler];
};
