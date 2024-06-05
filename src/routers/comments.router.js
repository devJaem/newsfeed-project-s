import express from 'express';
import { accessMiddleware } from '../middlewares/require-access-token.middleware.js';
import { prisma } from '../utils/prisma.util.js';
import { REVIEW_MESSAGES } from '../constants/review.constant.js';
import { catchError } from '../middlewares/error-handling.middleware.js';

const router = express.Router();

// 댓글 생성 api

router.post(
  '/:reviewId',
  accessMiddleware,
  catchError(async (req, res) => {
    const { reviewId } = req.params;
    const { id: userId } = req.user;
    const { content } = req.body;

    const review = await prisma.review.findUnique({
      where: {
        id: parseInt(reviewId, 10),
      },
    });
    if (!review)
      return res.status(404).json({
        status: 404,
        message: REVIEW_MESSAGES.REVIEW_NOT_FOUND,
      });

    const comment = await prisma.comment.create({
      data: {
        userId: +userId, // 댓글 작성자 ID
        reviewId: +reviewId, // 댓글 작성 게시글 ID
        content: content,
      },
    });

    return res.status(201).json({
      status: 201,
      data: comment,
    });
  })
);

// 댓글 조회 api
router.get(
  '/:reviewId',
  catchError(async (req, res, next) => {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        id: parseInt(reviewId),
      },
    });
    if (!review)
      return res.status(404).json({
        message: REVIEW_MESSAGES.REVIEW_NOT_FOUND,
      });

    const comments = await prisma.comment.findMany({
      where: {
        reviewId: +reviewId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return res.status(200).json({ status: 200, data: comments });
  })
);

// 댓글 수정 api
router.patch(
  '/:commentId',
  accessMiddleware,
  catchError(async (req, res, next) => {
    const { commentId } = req.params;
    const { id: userId } = req.user;
    const { content } = req.body;

    const comment = await prisma.comment.findUnique({
      where: {
        id: parseInt(commentId),
      },
    });
    if (!comment)
      return res.status(404).json({
        status: 404,
        message: '코멘트를 찾을 수가 없습니다.',
      });

    const Edit_Comment = await prisma.comment.update({
      where: {
        id: parseInt(commentId),
      },
      data: {
        content: content,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return res
      .status(200)
      .json({ status: 200, message: '댓글 수정완료', data: Edit_Comment });
  })
);

// 댓글 삭제 api
router.delete(
  '/:commentId',
  accessMiddleware,
  catchError(async (req, res, next) => {
    const { commentId } = req.params;
    const { id: userId } = req.user;

    const comment = await prisma.comment.findUnique({
      where: {
        id: parseInt(commentId),
      },
    });
    if (!comment)
      return res.status(404).json({
        status: 404,
        message: '댓글을 찾을수 없습니다.',
      });
    await prisma.comment.delete({ where: { id: parseInt(commentId) } });
    return res.status(200).json({ status: 200, message: '댓글 삭제 완료' });
  })
);

export default router;
