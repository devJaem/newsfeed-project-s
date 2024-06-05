import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { accessMiddleware } from '../middlewares/require-access-token.middleware.js';

const router = express.Router();

// 좋아요 추가 API
router.post('/', accessMiddleware, async (req, res) => {
    const { userId } = req.user;
    const { itemId, itemType } = req.body;
    try {
        const like = await prisma.like.create({
            data: {
                userId,
                itemId,
                itemType,
            },
        });
        res.status(201).json({
            status: 201,
            data: like,
            message: '좋아요가 성공적으로 추가되었습니다.',
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 좋아요 제거 API
router.delete('/', accessMiddleware, async (req, res) => {
    const { userId } = req.user;
    const { itemId, itemType } = req.body;
    try {
        await prisma.like.deleteMany({
            where: {
                userId,
                itemId,
                itemType,
            },
        });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
