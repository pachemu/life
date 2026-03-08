import { add } from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
import { errors } from '../../../shared/errors.js';
import type { EmailSender } from '../domain/email.service.js';
import type { UserRepository } from '../domain/user.repository.js';
import type { User } from '../user.types.js';
import type {
  AccessToken,
  RefreshToken,
  TokenPayload,
  TokenService,
} from '../domain/token.service.js';
import { HTTP_STATUSES } from '../../../shared/HTTP_STATUSES.js';

type responseLogin = {
  AccessToken: AccessToken;
  RefreshToken: RefreshToken;
  User: User;
};

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
    throw new errors.AppError(400, 'couldnt create user');
  }
  try {
    await emailService.sendEmail(
      `Your verification code: ${userToCreate.confirmationCode}.
    Link for verification : 
    http://localhost:3000/user/verify?code=${userToCreate.confirmationCode}&email=${userToCreate.email}`,
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
  userData: {
    login: string;
    password: string;
  },
  tokenService: TokenService,
): Promise<responseLogin> => {
  let user = await repo.loginUser(userData);
  if (!user) {
    throw new errors.AppError(401, 'Unathorized');
  }
  const accessToken = tokenService.signAccess(user);
  const refreshToken = tokenService.signRefresh(user);
  return {
    AccessToken: accessToken,
    RefreshToken: refreshToken,
    User: user,
  };
};

const getAllUsers = async (repo: UserRepository): Promise<User[]> => {
  let result = await repo.getAllUsers();
  return result;
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
  if (!user) return false;

  if (user.confirmationCode !== code) return false;
  if (user.expirationCodeTime.getTime() < Date.now()) return false;
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
    payload = tokenService.verifyRefresh(refreshToken);
    payload = {
      userId: payload.userId,
      email: payload.email,
      login: payload.login,
    }; // т.к. первый пейлоад хранит данные о времени истечения.
  } catch {
    throw new errors.AppError(
      HTTP_STATUSES.UNATHORIZED_401,
      'invalid refresh token',
    );
  }

  const accessToken = tokenService.signAccess(payload);
  const newRefreshToken = tokenService.signRefresh(payload);

  return { AccessToken: accessToken, RefreshToken: newRefreshToken };
};

export const useCases = {
  createUser,
  loginUser,
  getAllUsers,
  deleteUser,
  verifyUser,
  refreshTokens,
};
