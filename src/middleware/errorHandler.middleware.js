import { StatusCodes } from 'http-status-codes';
import { filterStackMessage } from '../utils/helpers.js';
import createError from 'http-errors';

export const errorHandlerMiddleware = (err, req, res, next) => {
  // console.log(Object.getOwnPropertyDescriptors(err));
  let statusCode = 500;
  let message = 'Internal Server Error';
  // error from express-validator
  let errorsArray = err.modifiedErrors || undefined;
  // show stack only in development
  let stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

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

  // Duplicate Value Error
  if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    const value = err.keyValue[key];
    errorMessage = `${key} ${value} already exists please try another`;
    statusCode = StatusCodes.CONFLICT;
  }

  // response that shoule be send for every type of error
  const jsonResponse = {
    status: 'fail',
    message,
    errorsArray,
    stack,
  };

  res.status(statusCode).json(jsonResponse);
};
