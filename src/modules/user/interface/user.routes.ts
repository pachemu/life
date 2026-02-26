import type { Router, Response, Request } from 'express';
import type {
  LoginUserInput,
  UserRepository,
} from '../domain/user.repository.js';
import { useCases } from '../application/user.useCases.js';
import { HTTP_STATUSES } from '../../../shared/HTTP_STATUSES.js';
import type {
  DeleteModel,
  RequestWithBody,
  RequestWithParams,
} from '../../../shared/routes.types.js';
import { jwtTokenService } from '../infrastructure/jwt.token.service.js';
import { middlewares } from './user.middleware.js';
import { sharedMiddlewares } from '../../../shared/middlewares.js';
import type { User } from '../user.types.js';

export const getUserRouter = (
  router: Router,
  userRepositoryMongo: UserRepository,
) => {
  router.post(
    '/register',
    middlewares.validationCreateUserMiddleware,
    async (req: RequestWithBody<any>, res: Response<{ message: string }>) => {
      const result = await useCases.createUser(userRepositoryMongo, req.body);
      return res.status(HTTP_STATUSES.OK_200).json({ message: result });
    },
  );
  router.post(
    '/login',
    middlewares.validationLoginUserMiddleware,
    // sharedMiddlewares.validationTokenMiddleware,  было для теста обработчика.
    async (req: RequestWithBody<LoginUserInput>, res: Response<string>) => {
      const result = await useCases.loginUser(userRepositoryMongo, req.body);
      const token = jwtTokenService.sign(result);

      return res.status(HTTP_STATUSES.OK_200).send(token);
    },
  );
  router.get(
    '/users',
    //middleware,
    async (req: Request, res: Response<User[]>) => {
      const result = await useCases.getAllUsers(userRepositoryMongo);
      return result;
    },
  );
  router.delete(
    '/delete/:id',
    async (
      req: RequestWithParams<DeleteModel>,
      res: Response<{ message: boolean }>,
    ) => {
      const result = await useCases.deleteUser(
        userRepositoryMongo,
        req.params.id,
      );
      return res.status(HTTP_STATUSES.OK_200).send({ message: result });
    },
  );
};
