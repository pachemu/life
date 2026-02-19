import type { UserRepository } from '../domain/user.repository.js';

const createUser = async (
  repo: UserRepository,
  userData: {
    email: string;
    login: string;
    password: string;
  },
) => {
  let result = await repo.createUser(userData);
  return result;
};

const loginUser = async (
  repo: UserRepository,
  userData: {
    login: string;
    password: string;
  },
) => {
  let result = await repo.loginUser(userData);
  return result;
};

export const useCases = {
  createUser,
  loginUser,
};
