import express from 'express';
import authRouter from './auth.router.js';
import usersRouter from './user.router.js';
<<<<<<< HEAD:src/routers/route.js
import reviewRouter from './review.router.js';
=======
import commentsRouter from './comments.router.js';
>>>>>>> develop:src/routers/router.js

const route = express.Router();

route.use('/auth', authRouter);
route.use('/users', usersRouter);
<<<<<<< HEAD:src/routers/route.js
route.use('/reviews', reviewRouter);
=======
route.use('/comments', commentsRouter);
>>>>>>> develop:src/routers/router.js

export default route;
