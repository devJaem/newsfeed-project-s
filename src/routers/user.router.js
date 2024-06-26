import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma.util.js';
import { catchError } from '../middlewares/error-handling.middleware.js';
import { ENV } from '../constants/env.constant.js';
import { USER_MESSAGES } from '../constants/user.constant.js';
import { accessMiddleware } from '../middlewares/require-access-token.middleware.js';
import { refreshMiddleware } from '../middlewares/require-refresh-token.middleware.js';
import { validateUpdateProfile } from '../middlewares/validations/sign.validation.middleware.js';

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
  '/profile',
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

/* 내 정보 조회 API */
userRouter.get(
  '/profile',
  accessMiddleware,
  catchError(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: USER_MESSAGES.USER_NOT_FOUND,
      });
    }

    res.status(200).json({
      status: 200,
      message: USER_MESSAGES.PROFILE_SUCESS,
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

/* 특정 사용자 정보 조회 API */
userRouter.get(
  '/:id',
  catchError(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: USER_MESSAGES.USER_NOT_FOUND,
      });
    }

    res.status(200).json({
      status: 200,
      message: USER_MESSAGES.PROFILE_SUCESS,
      data: {
        userId: user.id,
        nickname: user.nickname,
        createdAt: user.createdAt,
      },
    });
  })
);

/* 회원 정보 수정 API */
userRouter.patch(
  '/profile',
  accessMiddleware,
  validateUpdateProfile, // 회원정보 수정 유효성 검증 미들웨어 추가
  catchError(async (req, res) => {
    const { id } = req.user;
    const { nickname, password, birth } = req.body;

    const updateData = {};
    if (nickname) updateData.nickname = nickname;
    if (password) {
      const hashPassword = await bcrypt.hash(
        password,
        parseInt(ENV.HASH_ROUND)
      );
      updateData.password = hashPassword;
    }
    if (birth) updateData.birth = birth;

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
    });

    return res.status(200).json({
      status: 200,
      message: USER_MESSAGES.PROFILE_UPDATED,
      data: {
        userId: updatedUser.id,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        birth: updatedUser.birth,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  })
);

export default userRouter;
