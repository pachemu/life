import type { Router, Response, Request } from 'express';
import type {
  LoginUserInput,
  UserRepository,
  VerifyUserInput,
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
import type { User } from '../user.types.js';
import type { EmailSender } from '../domain/email.service.js';
import type { AccessToken } from '../domain/token.service.js';

export const getUserRouter = (
  router: Router,
  userRepositoryMongo: UserRepository,
  EmailSender: EmailSender,
) => {
  router.post(
    '/register',
    middlewares.validationCreateUserMiddleware,
    async (req: RequestWithBody<any>, res: Response<{ message: User }>) => {
      const result = await useCases.createUser(
        userRepositoryMongo,
        req.body,
        EmailSender,
      );
      return res.status(HTTP_STATUSES.CREATED_201).json({ message: result });
    },
  );
  router.post(
    '/login',
    middlewares.validationLoginUserMiddleware,
    // sharedMiddlewares.validationTokenMiddleware,  было для теста обработчика.
    async (
      req: RequestWithBody<LoginUserInput>,
      res: Response<{ message: string }>,
    ) => {
      const authResult = await useCases.loginUser(
        userRepositoryMongo,
        req.body,
        jwtTokenService,
      );

      const AccessToken = authResult.AccessToken;
      const RefreshToken = authResult.RefreshToken;

      return res
        .status(HTTP_STATUSES.OK_200)
        .cookie('refreshToken', RefreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          path: '/user/refresh',
        })
        .send({ message: AccessToken });
    },
  );
  router.post(
    '/refresh',
    async (
      req: RequestWithBody<any>,
      res: Response<{ message: AccessToken }>,
    ) => {
      const authTokens = await useCases.refreshTokens(
        userRepositoryMongo,
        jwtTokenService,
        req.cookies?.refreshToken,
      );

      const AccessToken = authTokens.AccessToken;
      const RefreshToken = authTokens.RefreshToken;
      return res
        .status(HTTP_STATUSES.OK_200)
        .cookie('refreshToken', RefreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          path: '/user/refresh',
        })
        .send({ message: AccessToken });
    },
  );
  router.get(
    '/verify',
    // нужно вставить middleware, чтобы не делать raw и etc.
    async (
      req: RequestWithBody<VerifyUserInput>,
      res: Response<{ message: boolean }>,
    ) => {
      const raw = req.query.code;
      const code = Array.isArray(raw) ? raw[0] : raw;

      if (typeof code !== 'string' || !code) {
        return res
          .status(HTTP_STATUSES.BAD_REQUEST_400)
          .json({ message: false });
      }

      const result = await useCases.verifyUser(userRepositoryMongo, code);
      return res.status(HTTP_STATUSES.OK_200).send({ message: result });
    },
  );
  router.get(
    '/users',
    //middleware,
    async (req: Request, res: Response<{ message: User[] }>) => {
      const result = await useCases.getAllUsers(userRepositoryMongo);
      return res.status(HTTP_STATUSES.OK_200).send({ message: result });
    },
  );
  router.delete(
    '/delete/:id',
    middlewares.validationIdUserMiddleware,
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
  router.post(
    '/logout',
    //middleware,
    async (req: RequestWithBody<any>, res: Response<{ message: boolean }>) => {
      const result = await useCases.logoutUser(
        userRepositoryMongo,
        jwtTokenService,
        req.cookies?.refreshToken,
      );
      res.clearCookie('refreshToken', { path: '/user/refresh' });
      return res.status(HTTP_STATUSES.OK_200).send({ message: result });
    },
  );
};
