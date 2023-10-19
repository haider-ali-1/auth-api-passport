import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { filterStackMessage } from '../utils/helpers.js';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import mongoose from 'mongoose';

export const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err.name);

  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = getReasonPhrase(statusCode);
  let errors; // array[]

  // Express Validator Errors
  if (err instanceof createError.HttpError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  // JWT Errors
  else if (err instanceof jwt.TokenExpiredError) {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'token expire blah';
  }
  //
  else if (err instanceof jwt.JsonWebTokenError) {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'invalid token please login';
  }

  // Mongoose Errors

  // Invalid ObjectId Error
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = StatusCodes.NOT_FOUND;
    message = `invalid ${err.path}`;
  }

  //
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'invalid input data';
    errors = Object.values(err.errors).map((err) => {
      const { path, message, value, properties } = err;
      let customMessage = message;
      if (properties.type === 'required') customMessage = `${path} is required`;
      return { field: path, message: customMessage, value: value || '' };
    });
  }

  // Duplicate Value Error
  else if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    const value = err.keyValue[key];
    statusCode = StatusCodes.CONFLICT;
    message = `invalid input data`;
    errors = [{ field: key, message: `${key} already exists`, value }];
  }

  const inDevEnv = process.env.NODE_ENV === 'development';

  // Final Error Response
  res.status(statusCode).json({
    status: 'fail',
    message,
    errors,
    stack: inDevEnv ? err.stack : undefined,
  });
};
