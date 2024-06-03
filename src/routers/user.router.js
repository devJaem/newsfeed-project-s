import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import { catchError } from '../middlewares/error-handling.middleware.js';
import { accessMiddleware } from '../middlewares/require-access-token.middleware.js';
import { refreshMiddleware } from '../middlewares/require-refresh-token.middleware.js';
import { ENV } from '../constants/env.constant.js';
import { USER_MESSAGES } from '../constants/user.constant.js';

const userRouter = express.Router();

/* 사용자 정보 조회 API */
userRouter.get(
  '/me',
  accessMiddleware,
  catchError(async (req, res) => {
    const user = req.user;
    res.status(200).json({
      status: 200,
      message: USER_MESSAGES.PROFILE_SUCCESS,
      data: {
        userId: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  })
);

/* RefreshToken 재발급 API */
userRouter.post(
  '/token',
  refreshMiddleware,
  catchError(async (req, res) => {
    const { id, role } = req.user;

    const accessToken = jwt.sign(
      {
        userId: id,
        role: role,
      },
      ENV.ACCESS_KEY,
      { expiresIn: ENV.ACCESS_TIME }
    );

    const refreshToken = jwt.sign(
      {
        userId: id,
        role: role,
      },
      ENV.REFRESH_KEY,
      { expiresIn: ENV.REFRESH_TIME }
    );

    // 트랜잭션으로 기존 리프레시 토큰을 삭제하고 새로운 토큰을 생성
    await prisma.$transaction(async (tr) => {
      await tr.refreshToken.deleteMany({
        where: {
          userId: id,
        },
      });

      await tr.refreshToken.create({
        data: {
          userId: id,
          refreshToken: refreshToken,
        },
      });
    });

    return res.status(200).json({
      status: 200,
      message: USER_MESSAGES.RENEW_TOKEN,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  })
);

/* 로그아웃 API */
userRouter.get(
  '/logout',
  accessMiddleware,
  catchError(async (req, res) => {
    const { id } = req.user;

    await prisma.refreshToken.deleteMany({
      where: {
        userId: id,
      },
    });

    return res.status(200).json({
      status: 200,
      message: USER_MESSAGES.LOGOUT_SUCCESS,
      data: {
        userId: id,
      },
    });
  })
);

export default userRouter;
