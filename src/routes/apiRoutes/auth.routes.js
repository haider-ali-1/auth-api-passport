import { Router } from 'express';
import { passport } from '../../passport/index.js';
import '../../passport/index.js';
import {
  handleOAuthLogin,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  verifyEmail,
} from '../../controllers/auth.controller.js';

import {
  loginUserValidator,
  registerUserValidator,
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
export { router };
