import { validationResult } from 'express-validator';
import { asyncHandler } from '../utils/helpers.js';
import createError from 'http-errors';

export const validate = (validations) => {
  const errorHandler = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const errorMessage = errors
      .array()
      .map((err) => {
        return err.msg;
      })
      .join('. ');

    const httpErrors = errors.array().map((err) => {
      const { path, msg } = err;
      return { [path]: msg };
    });

    throw new createError(400, errorMessage, { httpErrors });
  });
  return [validations, errorHandler];
};
