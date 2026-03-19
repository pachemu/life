import { add } from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { errors } from '../../../shared/errors.js';
import type { EmailSender } from '../domain/email.service.js';
import type { UserRepository } from '../domain/user.repository.js';
import type { responseLogin, User, userData } from '../user.types.js';
import type {
  RefreshToken,
  TokenPayload,
  TokenService,
} from '../domain/token.service.js';
import { HTTP_STATUSES } from '../../../shared/HTTP_STATUSES.js';
import { ENV } from '../../../shared/env.js';

const getCleanPayload = (tokenService: TokenService, refreshToken: string) => {
  const payload = tokenService.verifyRefresh(refreshToken);
  return { userId: payload.userId, email: payload.email, login: payload.login };
};

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

const assertRefreshMatches = (user: User, refreshToken: string) => {
  if (!user.refreshTokenHash) {
    throw new errors.AppError(401, 'Invalid refresh token');
  }
  const incomingHash = hashToken(refreshToken);
  if (incomingHash !== user.refreshTokenHash) {
    throw new errors.AppError(401, 'Invalid refresh token');
  }
};

const SERVER_URL = ENV.MONGO_URL;

const createUser = async (
  repo: UserRepository,
  userData: {
    email: string;
    login: string;
    password: string;
  },
  emailService: EmailSender,
): Promise<User> => {
  const code = uuidv4();
  const userToCreate = {
    ...userData,
    confirmationCode: code,
    expirationCodeTime: add(new Date(), {
      hours: 1,
    }), // Надо создание кода перенести в отдельный Code Generator
  };
  const result = await repo.createUser(userToCreate);
  if (!result) {
    throw new errors.AppError(
      409,
      'User with this email or login already registred',
    );
  }
  try {
    await emailService.sendEmail(
      `Your verification code: ${userToCreate.confirmationCode}.
    Link for verification : 
    ${SERVER_URL}/user/verify?code=${userToCreate.confirmationCode}&email=${userToCreate.email}`,
      userData.email,
    );
  } catch (e) {
    await repo.deleteUser(result.userId);
    throw new errors.AppError(500, 'Email not sent');
  }

  return result;
};

const loginUser = async (
  repo: UserRepository,
  userData: userData,
  tokenService: TokenService,
): Promise<responseLogin> => {
  let user = await repo.loginUser(userData);
  if (!user || !user.isConfirmed) {
    throw new errors.AppError(401, 'Unathorized');
  }
  const payload: TokenPayload = {
    userId: user.userId,
    email: user.email,
    login: user.login,
  };
  const accessToken = tokenService.signAccess(payload);
  const refreshToken = tokenService.signRefresh(payload);
  const refreshHash = hashToken(refreshToken);
  const updated = await repo.updateRefreshToken(user.userId, refreshHash);
  if (!updated) {
    throw new errors.AppError(500, 'couldnt save refresh token');
  }
  return {
    AccessToken: accessToken,
    RefreshToken: refreshToken,
    User: user,
  };
};

const getAllUsers = async (repo: UserRepository): Promise<User[]> => {
  return await repo.getAllUsers();
};

const deleteUser = async (
  repo: UserRepository,
  userId: string,
): Promise<boolean> => {
  let result = await repo.deleteUser(userId);
  return result;
};

const verifyUser = async (
  repo: UserRepository,
  code: string,
): Promise<boolean> => {
  const user = await repo.findByVerificationCode(code);
  const expiredAt = user?.expirationCodeTime?.getTime();
  const isInvalid =
    !user ||
    user.confirmationCode !== code ||
    !expiredAt ||
    expiredAt < Date.now();

  if (isInvalid) {
    throw new errors.AppError(400, 'Invalid or expired code');
  }
  const result = await repo.confirmUser(user.userId);
  if (!result) {
    throw new errors.AppError(
      HTTP_STATUSES.UNATHORIZED_401,
      'couldnt confirm user',
    );
  }
  return result;
};

const refreshTokens = async (
  repo: UserRepository,
  tokenService: TokenService,
  refreshToken: string | undefined,
) => {
  if (!refreshToken) {
    throw new errors.AppError(
      HTTP_STATUSES.UNATHORIZED_401,
      'check your refresh token',
    );
  }

  let payload: TokenPayload;
  try {
    payload = getCleanPayload(tokenService, refreshToken);
  } catch {
    throw new errors.AppError(
      HTTP_STATUSES.UNATHORIZED_401,
      'invalid refresh token',
    );
  }
  const user = await repo.findById(payload.userId);

  if (!user) {
    throw new errors.AppError(401, 'Invalid refresh token');
  }

  assertRefreshMatches(user, refreshToken);

  const accessToken = tokenService.signAccess(payload);
  const newRefreshToken = tokenService.signRefresh(payload);
  const newHash = hashToken(newRefreshToken);
  const saved = await repo.updateRefreshToken(user.userId, newHash);
  if (!saved) {
    throw new errors.AppError(500, 'couldnt rotate refresh token');
  }

  return { AccessToken: accessToken, RefreshToken: newRefreshToken };
};
const logoutUser = async (
  repo: UserRepository,
  tokenService: TokenService,
  refreshToken: RefreshToken | undefined,
): Promise<boolean> => {
  if (!refreshToken) {
    throw new errors.AppError(401, 'No refresh token');
  }
  let payload: TokenPayload;
  try {
    payload = getCleanPayload(tokenService, refreshToken);
  } catch {
    throw new errors.AppError(401, 'Invalid refresh token');
  }
  const user = await repo.findById(payload.userId);
  if (!user) {
    throw new errors.AppError(401, 'Invalid refresh token');
  }

  assertRefreshMatches(user, refreshToken);

  return await repo.updateRefreshToken(payload.userId, null);
};
export const useCases = {
  createUser,
  loginUser,
  getAllUsers,
  deleteUser,
  verifyUser,
  refreshTokens,
  logoutUser,
};
