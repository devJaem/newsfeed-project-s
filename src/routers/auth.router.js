import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.util.js';
import {
  validateSignup,
  validateSignin,
} from '../middlewares/validations/sign.validation.middleware.js';
import { catchError } from '../middlewares/error-handling.middleware.js';
import { ENV } from '../constants/env.constant.js';
import { AUTH_MESSAGES } from '../constants/auth.constant.js';
import { USER_MESSAGES } from '../constants/user.constant.js';

const authRouter = express.Router();

/* 회원가입 API */
authRouter.post(
  '/sign-up',
  validateSignup,
  catchError(async (req, res) => {
    const createUser = req.body;

    const user = await prisma.user.findFirst({
      where: { email: createUser.email },
    });
    if (user) {
      return res.status(409).json({
        status: 409,
        message: USER_MESSAGES.DUPLICATE_EMAIL,
      });
    }

    const hashPassword = await bcrypt.hash(
      createUser.password,
      parseInt(ENV.HASH_ROUND)
    );
    const newUser = await prisma.user.create({
      data: {
        email: createUser.email,
        password: hashPassword,
        nickname: createUser.nickname,
        birth: createUser.birth,
        role: 'USER',
      },
    });

    const { id, email, createdAt, updatedAt, nickname, role } = newUser;

    res.status(201).json({
      status: 201,
      message: USER_MESSAGES.SIGN_UP_SUCCESS,
      data: {
        id,
        email,
        nickname,
        role,
        createdAt,
        updatedAt,
      },
    });
  })
);

/* 로그인 API */
authRouter.post(
  '/sign-in',
  validateSignin,
  catchError(async (req, res) => {
    const loginUser = req.body;

    const user = await prisma.user.findFirst({
      where: { email: loginUser.email },
    });
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: AUTH_MESSAGES.INVALID_AUTH,
      });
    }

    const match = await bcrypt.compare(loginUser.password, user.password);
    if (!match) {
      return res.status(401).json({
        status: 401,
        message: AUTH_MESSAGES.INVALID_AUTH,
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      ENV.ACCESS_KEY,
      {
        expiresIn: ENV.ACCESS_TIME,
      }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      ENV.REFRESH_KEY,
      {
        expiresIn: ENV.REFRESH_TIME,
      }
    );

    // 트랜잭션을 사용하여 기존 리프레시 토큰 삭제 후 새로 생성
    await prisma.$transaction(async (tr) => {
      await tr.refreshToken.deleteMany({
        where: { userId: user.id },
      });
      await tr.refreshToken.create({
        data: {
          userId: user.id,
          refreshToken: refreshToken,
        },
      });
    });

        // Secure cookie에 refresh token 저장
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
        });

        return res.status(200).json({
          status: 200,
          message: USER_MESSAGES.SIGN_IN_SUCESS,
          data: {
            accessToken: accessToken,
          },
        });
  })
);

export default authRouter;
