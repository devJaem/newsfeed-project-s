import { prisma } from '../utils/prisma.util.js';
import { ENV } from '../constants/env.constant.js';
import { validateToken } from '../utils/jwt.util.js';
import { AUTH_MESSAGES } from '../constants/auth.constant.js';
import { USER_MESSAGES } from '../constants/user.constant.js';
import { catchError } from './error-handling.middleware.js';

/* RefreshToken 검증, 재발급 미들웨어 */
const refreshMiddleware = catchError(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({
      status: 400,
      message: AUTH_MESSAGES.NO_AUTH_INFO,
    });
  }

  const { payload, error } = await validateToken(refreshToken, ENV.REFRESH_KEY);
  if (error) {
    return res.status(401).json({
      status: 401,
      message: error,
    });
  }

  const tokenData = await prisma.refreshToken.findFirst({
    where: {
      userId: payload.userId,
      refreshToken: refreshToken,
    },
  });
  if (!tokenData) {
    return res.status(400).json({
      status: 400,
      message: AUTH_MESSAGES.TOKEN_END,
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });
  if (!user) {
    return res.status(404).json({
      status: 404,
      message: USER_MESSAGES.USER_NOT_FOUND,
    });
  }

  req.user = user;
  next();
});

export { refreshMiddleware };
