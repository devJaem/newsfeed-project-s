import express from 'express';
import prisma from '../utils/prisma.util.js';
import { catchError } from '../middlewares/error-handling.middleware.js';
import { accessMiddleware } from '../middlewares/require-access-token.middleware.js';
import { USER_MESSAGES } from '../constants/user.constant.js';
import { FOLLOW_MESSAGES } from '../constants/follow.constant.js';

const followsRouter = express.Router();

/* 팔로우 추가 API */
followsRouter.post(
  '/:followeeId',
  accessMiddleware,
  catchError(async (req, res) => {
    const followeeId = parseInt(req.params.followeeId, 10);
    const followerId = req.user.id;

    if (followeeId === followerId) {
      return res.status(400).json({
        status: 400,
        message: FOLLOW_MESSAGES.FOLLOW_SELF,
      });
    }

    const followee = await prisma.user.findUnique({
      where: { id: followeeId },
    });

    if (!followee) {
      return res.status(404).json({
        status: 404,
        message: USER_MESSAGES.USER_NOT_FOUND,
      });
    }

    const existingFollow = await prisma.follow.findFirst({
      where: {
        followee: followeeId,
        follower: followerId,
      },
    });

    if (existingFollow) {
      return res.status(409).json({
        status: 409,
        message: FOLLOW_MESSAGES.ALREADY_FOLLOWING,
      });
    }

    const follow = await prisma.follow.create({
      data: {
        followee: followeeId,
        follower: followerId,
      },
    });

    res.status(201).json({
      status: 201,
      message: FOLLOW_MESSAGES.FOLLOW_SUCCESS,
      data: follow,
    });
  })
);

/* 팔로워 목록 조회 API */
followsRouter.get(
  '/followers/:userId',
  catchError(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);

    const followers = await prisma.follow.findMany({
      where: { followee: userId },
      include: {
        followerUser: {
          select: { id: true, nickname: true, createdAt: true },
        },
      },
    });

    const formattedFollowers = followers.map((follow) => ({
      id: follow.followerUser.id,
      nickname: follow.followerUser.nickname,
      createdAt: follow.followerUser.createdAt,
    }));

    res.status(200).json({
      status: 200,
      message: FOLLOW_MESSAGES.FOLLOWER_SUCCESS,
      data: formattedFollowers,
    });
  })
);

/* 팔로잉 목록 조회 API */
followsRouter.get(
  '/following/:userId',
  catchError(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);

    const following = await prisma.follow.findMany({
      where: { follower: userId },
      include: {
        followeeUser: {
          select: { id: true, nickname: true, createdAt: true },
        },
      },
    });

    const formattedFollowing = following.map((follow) => ({
      id: follow.followeeUser.id,
      nickname: follow.followeeUser.nickname,
      createdAt: follow.followeeUser.createdAt,
    }));

    res.status(200).json({
      status: 200,
      message: FOLLOW_MESSAGES.FOLLOWEE_SUCCESS,
      data: formattedFollowing,
    });
  })
);

/* 팔로우 삭제 API */
followsRouter.delete(
  '/:followeeId',
  accessMiddleware,
  catchError(async (req, res) => {
    const followeeId = parseInt(req.params.followeeId, 10);
    const followerId = req.user.id;

    const follow = await prisma.follow.findFirst({
      where: {
        followee: followeeId,
        follower: followerId,
      },
    });

    if (!follow) {
      return res.status(404).json({
        status: 404,
        message: FOLLOW_MESSAGES.FOLLOW_NOT_FOUND,
      });
    }

    await prisma.follow.delete({
      where: { id: follow.id },
    });

    res.status(200).json({
      status: 200,
      message: FOLLOW_MESSAGES.UNFOLLOW_SUCCESS,
    });
  })
);

export default followsRouter;
