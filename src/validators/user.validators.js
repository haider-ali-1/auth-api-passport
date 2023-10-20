import { body } from 'express-validator';
import { validate } from './validate.js';
import { USER_ROLE_ENUM } from '../constants.js';

export const updateUserValidator = validate([
  body('email')
    .if(body('email').notEmpty())
    .isEmail()
    .withMessage('invalid email format'),
]);

export const updateUserRoleValidator = validate([
  body('role').isIn(USER_ROLE_ENUM).withMessage('invalid role type'),
]);
