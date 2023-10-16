import { Router } from 'express';
import { ensureAuthenticated } from '../../middleware/auth.middleware.js';

const router = Router();

router.route('/').get((req, res, next) => {
  res.render('login');
});

router.route('/dashboard').get((req, res, next) => {
  res.render('dashboard');
});

export { router };
