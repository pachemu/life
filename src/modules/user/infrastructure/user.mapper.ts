import type { User, UserDbModel, UserViewModel } from '../user.types.js';

const toDomainUser = (db: UserDbModel): User => ({
  userId: String(db._id),
  email: db.email,
  login: db.login,
  isConfirmed: db.isConfirmed,
  confirmationCode: db.confirmationCode,
  expirationCodeTime: db.expirationCodeTime,
  refreshTokenHash: db.refreshTokenHash ?? null,
});

const toViewUser = (user: User): UserViewModel => ({
  userId: user.userId,
  email: user.email,
  login: user.login,
});

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
  toViewUser,
};
