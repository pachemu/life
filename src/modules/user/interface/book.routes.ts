import type { Router, Response } from 'express';
import type { UserRepository } from '../domain/user.repository.js';
import { useCases } from '../application/user.useCases.js';
import { HTTP_STATUSES } from '../../../shared/HTTP_STATUSES.js';
import type { RequestWithBody } from '../../../shared/routes.types.js';

export const getUserRouter = (
  router: Router,
  userRepositoryMongo: UserRepository,
) => {
  router.post(
    '/register',
    //middleware for login body - email and password u know,
    async (req: RequestWithBody<any>, res: Response<{ message: string }>) => {
      let result = await useCases.createUser(userRepositoryMongo, req.body);
      return res.status(HTTP_STATUSES.OK_200).json({ message: result });
    },
  );
  router.post(
    '/login',
    //also middleware for email and password,
    async (req: RequestWithBody<any>, res: Response<{ message: string }>) => {
      let result = await useCases.loginUser(userRepositoryMongo, req.body);

      return res.status(HTTP_STATUSES.OK_200).json({ message: result });
    },
  );
};
