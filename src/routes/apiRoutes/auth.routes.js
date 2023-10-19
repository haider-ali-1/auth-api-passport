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

router.post('/register', registerUserValidator, registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUserValidator, loginUser);
router.post('/logout', ensureAuthenticated, logoutUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, resetPassword);

// Google
router.route('/google').get(
  passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent',
    scope: ['email', 'profile'],
  })
);

router.route('/google/callback').get(
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  handleOAuthLogin
);

export { router };
