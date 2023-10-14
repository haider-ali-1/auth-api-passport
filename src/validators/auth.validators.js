import { body, param } from 'express-validator';
import { validate } from './validate.js';
import { User } from '../models/user.model.js';
import createError from 'http-errors';

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
    .if(body('email').notEmpty())
    .isLength({ min: 6 })
    .withMessage('password must be at least 6 characters long'),
]);

export const loginUserValidator = validate([
  body('email').trim().notEmpty().withMessage('email is required'),
  body('password').trim().notEmpty().withMessage('password is required'),
]);
