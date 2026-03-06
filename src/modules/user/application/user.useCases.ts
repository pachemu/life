import { add } from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
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
  await emailService.sendEmail(
    `Your verification code: ${userToCreate.confirmationCode}.
    Link for verification : 
    http://localhost:3000/user/verify?code=${userToCreate.confirmationCode}&email=${userToCreate.email}`,
    userData.email,
  );
  return result;
};

const verifyUser = async (
  repo: UserRepository,
  code: string,
): Promise<boolean> => {
  const user = await repo.confirmUser(code);
  if (!user) {
    throw new errors.AppError(400, 'Not expected code'); // построить норм код
  }
  return user;
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
  verifyUser,
};
