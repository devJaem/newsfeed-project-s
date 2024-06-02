import jwt from 'jsonwebtoken';
import { AUTH_MESSAGES } from '../constants/auth.constant.js';

/* JWT payload 분해함수 */
const validateToken = async (token, key) => {
  try {
    const payload = jwt.verify(token, key);
    return { payload, error: null };
  } catch (error) {
    if (error.name === AUTH_MESSAGES.TOKEN_EXPIRED) {
      return { payload: null, error: AUTH_MESSAGES.TOKEN_EXPIRED };
    } else {
      return { payload: null, error: AUTH_MESSAGES.INVALID_AUTH };
    }
  }
};

export { validateToken };
