import { body, param } from 'express-validator';
import { validate } from './validate.js';
import { User } from '../models/user.model.js';
import createError from 'http-errors';
import mongoose from 'mongoose';
import { USER_ROLE_ENUM } from '../constants.js';

export const updateUserValidator = validate([
  body('email')
    .if(body('email').notEmpty())
    .isEmail()
    .withMessage('invalid email format'),
]);

export const changeUserRoleValidator = validate([
  body('role').isIn(USER_ROLE_ENUM).withMessage('invalid role type'),
]);
