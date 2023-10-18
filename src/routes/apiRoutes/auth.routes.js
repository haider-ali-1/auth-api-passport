import { Router } from 'express';
import { passport } from '../../passport/index.js';
import '../../passport/index.js';
import {
  forgotPassword,
  handleOAuthLogin,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
  verifyEmail,
} from '../../controllers/auth.controller.js';

import {
  forgotPasswordValidator,
  loginUserValidator,
  registerUserValidator,
  resetPasswordValidator,
} from '../../validators/auth.validators.js';
import { ensureAuthenticated } from '../../middleware/auth.middleware.js';

// prettier-ignore

const router = Router();

router.route('/google').get(
  passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent',
    scope: ['email', 'profile'],
  })
);

router.route('/google/callback').get(
  // prettier-ignore
  passport.authenticate('google', {session: false, failureRedirect: '/login' }),
  handleOAuthLogin
);

// URL /api/v1/auth
router.route('/register').post(registerUserValidator, registerUser);
router.route('/verify-email/:token').get(verifyEmail);
router.route('/login').post(loginUserValidator, loginUser);
router.route('/logout').post(ensureAuthenticated, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/forgot-password').post(forgotPasswordValidator, forgotPassword);
router
  .route('/reset-password/:token')
  .post(resetPasswordValidator, resetPassword);

export { router };
