import 'dotenv/config';

let env = process.env;

export const ENV = {
  port: env.APP_PORT,
  mongoUrl: env.MONGO_URL,
  secretToken: env.SECRET_TOKEN || 'gus',
  GOOGLE_APP_PASSWORD: env.GOOGLE_APP_PASSWORD,
  GOOGLE_USER_GMAIL: env.GOOGLE_USER_GMAIL,
};
