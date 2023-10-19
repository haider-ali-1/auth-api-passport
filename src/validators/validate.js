import { validationResult } from 'express-validator';
import { asyncHandler } from '../utils/helpers.js';
import createError from 'http-errors';

export const validate = (validations) => {
  const errorHandler = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) return next();

    const expressValidatorErrors = errors.array().map((err) => {
      const { path, msg, value } = err;
      return { field: path, message: msg, value };
    });

    throw new createError(400, 'invalid input data', {
      errors: expressValidatorErrors,
    });
  });
  return [validations, errorHandler];
};
