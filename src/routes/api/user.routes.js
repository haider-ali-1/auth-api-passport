import passport from 'passport';
import { Router } from 'express';
import {
  ensureAuthenticated,
  ensureAuthorized,
} from '../../middleware/auth.middleware.js';
import {
  changeUserRole,
  deleteUser,
  getAllUsers,
  getCurrentUser,
  getSingleUser,
  updateUser,
} from '../../controllers/user.controller.js';
import {
  updateUserRoleValidator,
  updateUserValidator,
} from '../../validators/user.validators.js';
import { USER_ROLES } from '../../constants.js';

const router = Router();

// @ /api/v1/users

router
  .route('/')

  .get(ensureAuthenticated, ensureAuthorized([USER_ROLES.ADMIN]), getAllUsers);

router
  .route('/profile')

  .get(ensureAuthenticated, getCurrentUser)

  .patch(ensureAuthenticated, updateUserValidator, updateUser);

router
  .route('/:userId')

  .get(ensureAuthenticated, ensureAuthorized([USER_ROLES.ADMIN]), getSingleUser)

  .delete(
    ensureAuthenticated,
    ensureAuthorized([USER_ROLES.ADMIN]),
    deleteUser
  );

router
  .route('/:userId/update-role')

  .patch(
    ensureAuthenticated,
    ensureAuthorized(['admin']),
    updateUserRoleValidator,
    changeUserRole
  );

export { router };
