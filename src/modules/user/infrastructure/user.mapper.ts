import type { User } from '../domain/user.entity.js';
import type { UserDbModel } from './types/user.db.model.js';

const toDomainUser = (db: UserDbModel): User => ({
  userId: String(db._id),
  email: db.email,
  login: db.login,
  isConfirmed: db.isConfirmed,
  confirmationCode: db.confirmationCode,
  expirationCodeTime: db.expirationCodeTime,
  refreshTokenHash: db.refreshTokenHash ?? null,
});

export let infrastructureMappers = {
  toDomainUser,
};
