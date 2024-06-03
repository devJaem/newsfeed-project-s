import express from 'express';
import {accessMiddleware} from '../middlewares/require-access-token.middleware.js';
import { prisma } from '../utils/prisma.util.js';
import {REVIEW_MESSAGES} from '../constants/review.constant.js';

const router = express.Router();

// 댓글 생성 api

router.post(
  '/v1/comments/:reviewId',
  accessMiddleware,
  async (req, res, next) => {
    const { reviewId } = req.params;
    const { userId } = req.user;
    const { content } = req.body;

    const review = await prisma.review.findFirst({
      where: {
        reviewId: +reviewId,
      },
    });
    if (!review)
      return res.status(404).json({
        status : 404,
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
        status : 201,
        data: comment
    });
  },
);

// 댓글 조회 api
router.get(
    '/v1/comments/:reviewId',
    async(req, res, next) => {
        const {reviewId} = req.params;

        const review = await prisma.review.findFirst({
            where: {
                reviewId: +reviewId,
            },
        });
        if(!review)
            return res.status(404).json({
        message : REVIEW_MESSAGES.REVIEW_NOT_FOUND});

        const comments = await prisma.comment.findMany({
            where: {
                reviewId: +reviewId,
            },
            orderBy: {
                createdAt : 'desc',
            },
        });
        return res.status(200).json({status: 200, data: comments,});
    });

// 댓글 수정 api

router.patch(
    'v1/comments/:reviewId',
    accessMiddleware,
    async(req, res, next) => {
        const {reviewId} = req.params;
        const {userId} = req.user;
        const {content} = req.body;

        const review = await prisma.review.findFirst({
            where: {
              reviewId: +reviewId,
            },
          });
          if (!review)
            return res.status(404).json({
              status : 404,
              message: REVIEW_MESSAGES.REVIEW_NOT_FOUND,
          });

          const comment = await prisma.comment.update({
            data: {
                userId: +userId,
                reviewId: +reviewId,
                content: content
            },
            });
            return res.status(200).json({status: 200, message: "댓글 수정완료", data: comment});
    }
);

// 댓글 삭제 api
router.delete(
    '/v1/comments/:reviewId',
    accessMiddleware,
    async(req, res, next) => {
        const {reviewId} = req.params;
        const {userId} = req.user;

        const review = await prisma.review.findFirst({
            where: {
              reviewId: +reviewId,
            },
          });
          if (!review)
            return res.status(404).json({
              status : 404,
              message: REVIEW_MESSAGES.REVIEW_NOT_FOUND,
          });
          await prisma.comment.delete({ where: { reviewId: +reviewId } });
          return res.status(200).json({status: 200, message : "댓글 삭제 완료"});
    }
);




export default router;