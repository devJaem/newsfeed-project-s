import express from 'express';
import { accessMiddleware } from '../middlewares/require-access-token.middleware.js';
import { prisma } from '../utils/prisma.util.js';
import { catchError } from '../middlewares/error-handling.middleware.js';

const router = express.Router();

//리뷰에 좋아요 등록 api

router.post(
    '/review/:itemId',
    accessMiddleware,
    catchError(async(req, res) => {
        const {itemId} = req.params;
        const {id: userId} = req.user;

        const existingLike = await prisma.like.findFirst({
            where: {
                userId: userId, // 좋아요를 누른 사용자 ID
                itemId: parseInt(itemId, 10), // 좋아요를 누른 리뷰의 ID
                itemType: 'REVIEW', // 좋아요를 누른 항목의 타입이 REVIEW인지 확인
              },
          });
      
          if (existingLike) {
            return res.status(400).json({
              status: 400,
              message: '이미 좋아요를 눌렀습니다.',
            });
          }

        const reviewlike = await prisma.like.create({
            data: {
                userId: userId,
                itemId: parseInt(itemId, 10),
                itemType: 'REVIEW',
            }
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
    '/review/:itemId',
    catchError(async(req, res) => {
        const sortBy = (req.query.sort || 'desc').toLowerCase();
        const sortOption = sortBy === 'asc' ? 'asc' : 'desc';
        const {itemId} = req.params;

        const likeS = await prisma.like.findMany({
            where: {
                itemType: 'REVIEW',
                itemId: parseInt(itemId)
            },
            orderBy: {createdAt: sortOption}
        });
        return res.status(200).json({
            status: 200,
            message: "이 리뷰에 찍힌 좋아요 목록",
            data: likeS
        });
    })
)

//댓글에 좋아요 등록 api

router.post(
    '/comment/:itemId',
    accessMiddleware,
    catchError(async(req, res) => {
        const {itemId} = req.params;
        const {id: userId} = req.user;

        const existingLike = await prisma.like.findUnique({
            where: {
              userId_itemId_itemType: {
                userId: userId, // 좋아요를 누른 사용자 ID
                itemId: parseInt(itemId, 10), // 좋아요를 누른 리뷰의 ID
                itemType: 'COMMENT', // 좋아요를 누른 항목의 타입이 REVIEW인지 확인
              },
            },
          });
      
          if (existingLike) {
            return res.status(400).json({
              status: 400,
              message: '이미 좋아요를 눌렀습니다.',
            });
          }

        const commentlike = await prisma.like.create({
            data: {
                userId: userId,
                itemType: 'COMMENT',
                itemId: itemId
            }
        });
        return res.status(201).json({
            status: 201,
            message: '좋아요를 눌렀습니다.',
            data: commentlike,
          });
    })
);


// 댓글의 좋아요 조회 api

router.get(
    '/comment/:itemId',
    catchError(async(req, res, next) => {
        const sortBy = (req.query.sort || 'desc').toLowerCase();
        const sortOption = sortBy === 'asc' ? 'asc' : 'desc';
        const {itemId} = req.params;

        const likeS = await prisma.like.findMany({
            where: {
                itemType: 'COMMENT',
                itemId: parseInt(itemId)
            },
            orderBy: {createdAt: sortOption}
        });
        return res.status(200).json({
            status: 200,
            message: "이 리뷰에 찍힌 좋아요 목록",
            data: likeS
        });
    })
)

export default router;