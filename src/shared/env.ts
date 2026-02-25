let env = process.env;

export const ENV = {
  port: env.APP_PORT,
  mongoUrl: env.MONGO_URL,
  secretToken: env.SECRET_TOKEN || 'gus',
};
