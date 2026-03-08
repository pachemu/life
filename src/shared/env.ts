import 'dotenv/config';

let env = process.env;

export const ENV = {
  PORT: env.APP_PORT,
  MONGO_URL: env.MONGO_URL,
  ACCESS_TOKEN_SECRET: env.ACCESS_SECRET_TOKEN || 'gus',
  REFRESH_TOKEN_SECRET: env.REFRESH_SECRET_TOKEN || 'jwt',
  GOOGLE_APP_PASSWORD: env.GOOGLE_APP_PASSWORD,
  GOOGLE_USER_GMAIL: env.GOOGLE_USER_GMAIL,
};
