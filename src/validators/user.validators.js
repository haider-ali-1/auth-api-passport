import { body, param } from 'express-validator';
import { validate } from './validate.js';
import { User } from '../models/user.model.js';
import createError from 'http-errors';
import mongoose from 'mongoose';

export const updateUserValidator = validate([
  body('email')
    .if(body('email').notEmpty())
    .isEmail()
    .withMessage('invalid email format'),
]);
