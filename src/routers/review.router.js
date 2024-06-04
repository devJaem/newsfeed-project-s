import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { validateReviewCreate } from '../middlewares/validations/review.validation.middleware.js';
import { catchError } from '../middlewares/error-handling.middleware.js';
import { REVIEW_MESSAGES } from '../constants/review.constant.js';
import { accessMiddleware } from '../middlewares/require-access-token.middleware.js';


const reviewRouter = express.Router();

/* 리뷰 등록 API*/
reviewRouter.post(
    '/', 
    accessMiddleware,
    validateReviewCreate,
    catchError(async (req, res, next) =>{
        const { userId } = req.user;
        const { title, grade, content, category } = req.body;
        const review = await prisma.review.create({
            data:{
               userId: userId,
               title,
               grade,
               content,
               category,
            }
        })

        return res.status(200).json({
            status: 200,
            message: REVIEW_MESSAGES.REVIEW_CREATE_SUCCESS,
            data: review, 
        })
    })
);

/* 리뷰 목록 조회 API*/
reviewRouter.get('/', catchError(async (req, res, next) => {
 
    const sortBy = (req.query.sort || 'desc').toLowerCase();
    const sortOption = sortBy === 'asc' ? 'asc' : 'desc';
  
    const reviews = await prisma.review.findMany({
        select: {
            id: true,
            userId: true,
            title: true,
            grade: true,
            category: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { createdAt: sortOption },
    });

    return res.status(200).json({
        status: 200,
        data: reviews,
        message: REVIEW_MESSAGES.REVIEWS_READ_SUCCESS,
    });
  })
);
/* 리뷰 상세 조회 API*/
reviewRouter.get('/:reviewId', accessMiddleware, catchError(async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await prisma.review.findUnique({
        where: { id: +reviewId },
        select:{
            id: true,
            userId: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
        }
})

    if (!review) {
        return res.status(404).json({ message: REVIEW_MESSAGES.REVIEW_NOT_FOUND });
}

    return res.status(200).json({
        status: 200,
        data: review,
        message: REVIEW_MESSAGES.REVIEW_READ_SUCCESS,
    });
  })
);

/* 리뷰 수정 API*/
reviewRouter.patch('/:reviewId', accessMiddleware, catchError(async (req, res, next) => {
    const { userId } = req.user;
    const { reviewId } = req.params;
    const { title, content, category } = req.body;

    const review = await prisma.review.findUnique({
        where: {id: +reviewId}
    });

    if(!review){
        return res.status(404).json({ message: REVIEW_MESSAGES.REVIEW_NOT_FOUND})
    }
    
    const updatedReview = await prisma.review.update({
        data: {
            title: title? title : review.title,
            content: content? content : review.content,
            category: category? category : review.category,
        },
        where: { id: + reviewId},
        select:{
            id: true,
            userId: true,
            grade: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
        },
    })
  
    return res.status(200).json({ 
                            status: 200,
                            data: updatedReview,
                             message: REVIEW_MESSAGES.REVIEW_UPDATE_SUCCESS,
    });
  })
);

/* 리뷰 삭제 API*/
reviewRouter.delete('/:reviewId', accessMiddleware, catchError(async (req, res, next) => {
    const { userId } = req.user;
    const { reviewId } = req.params;

    const review = await prisma.review.findFirst({
        where:{
            id: +reviewId,
            userId: +userId,
        },
    });

    if(!review){
        return res.status(404).json({
            status:404,
            message: REVIEW_MESSAGES.REVIEW_NOT_FOUND,
        });
    }

    await prisma.review.delete({
        where: {id: +reviewId}
    });

    return res.status(200).json({ message: REVIEW_MESSAGES.REVIEW_DELETE_SUCCESS })
  })
);

export default reviewRouter;