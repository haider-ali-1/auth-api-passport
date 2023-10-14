import passport from 'passport';
import { Router } from 'express';
import {
  ensureAuthenticated,
  ensureAuthorized,
} from '../../middleware/auth.middleware.js';
import {
  deleteUser,
  getAllUsers,
  getCurrentUser,
  getSingleUser,
  refreshToken,
  updateUser,
} from '../../controllers/user.controller.js';
import { updateUserValidator } from '../../validators/user.validators.js';

const router = Router();
// @ /api/v1/users
router.route('/refresh-token').get(refreshToken);

// @ /api/v1/users

router
  .route('/')
  .get(ensureAuthenticated, ensureAuthorized(['admin']), getAllUsers);

router
  .route('/profile')
  .get(ensureAuthenticated, getCurrentUser)
  .patch(ensureAuthenticated, updateUserValidator, updateUser);

router
  .route('/:userId')
  .get(ensureAuthenticated, ensureAuthorized(['admin']), getSingleUser)
  .delete(ensureAuthenticated, ensureAuthorized(['admin']), deleteUser);

router.route('/:userId');

export { router };
