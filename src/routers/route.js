import express from 'express';
import authRouter from './auth.router.js';
import usersRouter from './user.router.js';

const route = express.Router();

route.use('/auth', authRouter);
route.use('/users', usersRouter);

export default route;
