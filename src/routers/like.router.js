import express from 'express';
import { accessMiddleware } from '../middlewares/require-access-token.middleware.js';
import { prisma } from '../utils/prisma.util.js';
import { catchError } from '../middlewares/error-handling.middleware.js';

const router = express.Router();

//리뷰에 좋아요 등록 api

//리뷰에 좋아요 등록 api
router.put(
  '/review/:reviewId',
  accessMiddleware,
  catchError(async (req, res) => {
    const { reviewId } = req.params;
    const { id: userId } = req.user;

    // 리뷰가 존재하는지 확인
    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId, 10) },
    });

    if (!review) {
      return res.status(404).json({
        status: 404,
        message: 'review를 찾을수 없습니다.',
      });
    }
    if (review.userId === userId) {
      return res.status(400).json({
        status: 400,
        message: '자기 글에는 좋아요를 누를수가 없습니다.',
      });
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: userId,
        reviewId: parseInt(reviewId, 10),
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      return res.status(200).json({
        status: 200,
        message: '좋아요를 취소하였습니다.',
      });
    }

    // 새로운 좋아요 생성
    const reviewLike = await prisma.like.create({
      data: {
        userId: userId,
        reviewId: parseInt(reviewId, 10),
      },
    });

    return res.status(201).json({
      status: 201,
      message: '좋아요를 눌렀습니다.',
      data: reviewLike,
    });
  })
);

// 리뷰의 좋아요 조회 api

router.get(
  '/review/:reviewId',
  catchError(async (req, res) => {
    const sortBy = (req.query.sort || 'desc').toLowerCase();
    const sortOption = sortBy === 'asc' ? 'asc' : 'desc';
    const { reviewId } = req.params;

    const likeS = await prisma.like.findMany({
      where: {
        reviewId: parseInt(reviewId),
      },
      orderBy: { createdAt: sortOption },
    });
    return res.status(200).json({
      status: 200,
      message: '이 리뷰에 찍힌 좋아요 목록',
      data: likeS,
    });
  })
);

//댓글에 좋아요 등록 api

router.put(
  '/comment/:commentId',
  accessMiddleware,
  catchError(async (req, res) => {
    const { commentId } = req.params;
    const { id: userId } = req.user;

    // 리뷰가 존재하는지 확인
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId, 10) },
    });

    if (!comment) {
      return res.status(404).json({
        status: 404,
        message: 'comment를 찾을수 없습니다.',
      });
    }
    if (comment.userId === userId) {
      return res.status(400).json({
        status: 400,
        message: '자기 글에는 좋아요를 누를수가 없습니다.',
      });
    }
    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: userId,
        commentId: parseInt(commentId, 10),
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      return res.status(200).json({
        status: 200,
        message: '좋아요를 취소하였습니다.',
      });
    }

    // 새로운 좋아요 생성
    const commentLike = await prisma.like.create({
      data: {
        userId: userId,
        commentId: parseInt(commentId, 10),
      },
    });

    return res.status(201).json({
      status: 201,
      message: '좋아요를 눌렀습니다.',
      data: commentLike,
    });
  })
);

// 댓글의 좋아요 조회 api

router.get(
  '/comment/:commentId',
  catchError(async (req, res, next) => {
    const sortBy = (req.query.sort || 'desc').toLowerCase();
    const sortOption = sortBy === 'asc' ? 'asc' : 'desc';
    const { commentId } = req.params;

    const likeS = await prisma.like.findMany({
      where: {
        commentId: parseInt(commentId),
      },
      orderBy: { createdAt: sortOption },
    });
    return res.status(200).json({
      status: 200,
      message: '이 리뷰에 찍힌 좋아요 목록',
      data: likeS,
    });
  })
);

export default router;
