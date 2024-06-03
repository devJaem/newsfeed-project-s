import express from 'express';
import authRouter from './auth.router.js';
import usersRouter from './user.router.js';
import commentsRouter from './comments.router.js';

const route = express.Router();

route.use('/auth', authRouter);
route.use('/users', usersRouter);
route.use('/comments', commentsRouter);

export default route;
