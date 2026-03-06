import type { User, UserDbModel } from '../user.types.js';

const toDomainUser = (userData: UserDbModel): User => {
  let user: User = {
    login: userData.login,
    email: userData.email,
    userId: String(userData._id),
    confirmationCode: userData.confirmationCode,
    expirationCodeTime: userData.expirationCodeTime,
    isConfirmed: userData.isConfirmed,
  };
  return user;
};

const toCreateUser = (userData: any) => {
  let user = {
    login: userData.login,
    email: userData.email,
    password: userData.password,
    date: userData.date,
  };
  return user;
};

export let userMappers = {
  toCreateUser: toCreateUser,
  toDomainUser,
};
