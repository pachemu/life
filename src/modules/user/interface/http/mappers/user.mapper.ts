import type { User } from '../../../domain/user.entity.js';
import type { UserViewModel } from '../routes/user.routes.types.js';

const toViewUser = (user: User): UserViewModel => ({
  userId: user.userId,
  email: user.email,
  login: user.login,
});

export const interfaceMappers = {
  toViewUser,
};
