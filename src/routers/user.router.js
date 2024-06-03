import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import { catchError } from '../middlewares/error-handling.middleware.js';
import { ENV } from '../constants/env.constant.js';
import { USER_MESSAGES } from '../constants/user.constant.js';
import { accessMiddleware} from '../middlewares/require-access-token.middleware.js'
import { refreshMiddleware } from '../middlewares/require-refresh-token.middleware.js';

const userRouter = express.Router();

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

    // HttpOnly 쿠키에 새로운 리프레시 토큰 저장
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
    });

    return res.status(200).json({
      status: 200,
      message: USER_MESSAGES.RENEW_TOKEN,
      accessToken: accessToken,
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

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 프로덕션 환경에서만 secure 설정
      sameSite: 'Strict', // Cross-site request를 방지
    });

    return res.status(200).json({
      status: 200,
      message: USER_MESSAGES.LOGOUT_SUCESS,
      data: {
        userId: id,
      },
    });
  })
);

/* 회원탈퇴 API */
userRouter.delete(
  '/delete-account',
  accessMiddleware,
  catchError(async (req, res) => {
    const { id } = req.user;

    // 사용자 삭제 (캐스케이딩 설정을 통해 관련 데이터도 자동 삭제)
    await prisma.user.delete({
      where: { id: id },
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
    });

    return res.status(200).json({
      status: 200,
      message: USER_MESSAGES.ACCOUNT_DELETED,
    });
  })
);

export default userRouter;