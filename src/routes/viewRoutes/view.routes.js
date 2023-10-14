import { Router } from 'express';
import { ensureAuthenticated } from '../../middleware/auth.middleware.js';

const router = Router();

router.route('/').get((req, res, next) => {
  res.render('login');
});

router.route('/dashboard').get(ensureAuthenticated, (req, res, next) => {
  const { name, role } = req.user;
  res.render('dashboard', { name, role });
});

export { router };
