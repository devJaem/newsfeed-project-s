import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  ACCESS_KEY: process.env.ACCESS_SECRET_KEY || 'default_access_secret_key',
  ACCESS_TIME: process.env.ACCESS_EXPIRATION_TIME || '12h', // 기본값 12시간
  REFRESH_KEY: process.env.REFRESH_SECRET_KEY || 'default_refresh_secret_key',
  REFRESH_TIME: process.env.REFRESH_TOKEN_EXPIRATION_TIME || '7d', // 기본값 1주일
  PORT: process.env.PORT || 2000,
  HASH_ROUND: process.env.HASH_ROUND || 5, // 기본값 bcrypt 라운드 10
};
