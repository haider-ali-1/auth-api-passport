import { StatusCodes } from 'http-status-codes';
import { filterStackMessage } from '../utils/helpers.js';
import createError from 'http-errors';

export const errorHandlerMiddleware = (err, req, res, next) => {
  // console.log(Object.getOwnPropertyDescriptors(err));
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (createError.isHttpError(err)) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // JWT Errors
  if (err.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'session expired please login';
  }

  // Mongoose Errors

  // Invalid ObjectId Error
  if (err.name === 'CastError') {
    statusCode = StatusCodes.NOT_FOUND;
    message = `invalid ${err.path}`;
  }

  //
  else if (err.name === 'ValidationError') {
    res.json({ err });
  }

  // Duplicate Value Error
  else if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    const value = err.keyValue[key];
    //
    statusCode = StatusCodes.CONFLICT;
    message = `${key} already exist please try another`;
  }

  const inDevEnv = process.env.NODE_ENV === 'development';

  // final error response
  res.status(statusCode).json({
    status: 'fail',
    message,
    errors: err.httpErrors || undefined,
    originalError: inDevEnv ? (err.httpErrors ? undefined : err) : undefined,
    stack: inDevEnv ? err.stack : undefined,
  });
};
