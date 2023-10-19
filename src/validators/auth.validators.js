import { body } from 'express-validator';
import { validate } from './validate.js';

export const registerUserValidator = validate([
  body('name').trim().notEmpty().withMessage('name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required')
    .if(body('email').notEmpty())
    .isEmail()
    .withMessage('invalid email format'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('password is required')
    .if(body('password').notEmpty())
    .isLength({ min: 6 })
    .withMessage('password must be at least 6 characters long'),
]);

export const loginUserValidator = validate([
  body('email').trim().notEmpty().withMessage('email is required'),
  body('password').trim().notEmpty().withMessage('password is required'),
]);

export const forgotPasswordValidator = validate([
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format'),
]);

export const resetPasswordValidator = validate([
  body('password').trim().notEmpty().withMessage('password is required'),
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('confirm password is required'),
  // .custom(async (value, { req }) => {
  //   return req.password === value ? true : false;
  // }),
]);
