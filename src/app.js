import path from 'node:path';

import passport from 'passport';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { __dirname } from './utils/helpers.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import { errorHandlerMiddleware } from './middleware/errorHandler.middleware.js';

import { router as AuthRouter } from './routes/api/auth.routes.js';
import { router as UserRouter } from './routes/api/user.routes.js';
import { router as ViewRouter } from './routes/viewRoutes/view.routes.js';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname(import.meta.url), './views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.use(passport.initialize());

app.use(morgan('dev'));

app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/users', UserRouter);
app.use(ViewRouter);

app.all('*', notFoundMiddleware);
app.use(errorHandlerMiddleware);

export { app };
