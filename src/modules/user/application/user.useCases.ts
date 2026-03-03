import { errors } from '../../../shared/errors.js';
import type { EmailSender } from '../domain/email.service.js';
import type { UserRepository } from '../domain/user.repository.js';
import type { User } from '../user.types.js';

const createUser = async (
  repo: UserRepository,
  userData: {
    email: string;
    login: string;
    password: string;
  },
  emailService: EmailSender,
): Promise<User> => {
  const result = await repo.createUser(userData);
  if (!result) {
    throw new errors.AppError(400, 'couldnt create user');
  }
  await emailService.sendEmail('Hello, my dear friend', userData.email);
  return result;
};

const loginUser = async (
  repo: UserRepository,
  userData: {
    login: string;
    password: string;
  },
): Promise<User> => {
  let result = await repo.loginUser(userData);
  if (!result) {
    throw new errors.AppError(401, 'Unathorized');
  }

  return result;
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

export const useCases = {
  createUser,
  loginUser,
  getAllUsers,
  deleteUser,
};
