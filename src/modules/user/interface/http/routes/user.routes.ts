import type { Router, Response, Request } from 'express';
import type {
  LoginUserInput,
  RegisterUserInput,
  UserRepository,
  VerifyUserInput,
} from '../../../domain/user.repository.js';
import { useCases } from '../../../application/user.useCases.js';
import { HTTP_STATUSES } from '../../../../../shared/HTTP_STATUSES.js';
import type {
  IdParams,
  RequestWithBody,
  RequestWithCookie,
  RequestWithParams,
  RequestWithQuery,
} from '../../../../../shared/routes.types.js';
import { middlewares } from '../middlewares/user.middleware.js';
import type { UserViewModel } from './user.routes.types.js';
import type { EmailSender } from '../../../domain/email.service.js';
import type {
  AccessToken,
  TokenService,
} from '../../../../auth/domain/token.service.js';
import { interfaceMappers } from '../mappers/user.mapper.js';

export const getUserRouter = (
  router: Router,
  userRepositoryMongo: UserRepository,
  EmailSender: EmailSender,
  jwtTokenService: TokenService,
) => {
  router.post(
    '/register',
    middlewares.validationCreateUserMiddleware,
    async (
      req: RequestWithBody<RegisterUserInput>,
      res: Response<{ message: UserViewModel }>,
    ) => {
      const result = await useCases.createUser(
        userRepositoryMongo,
        req.body,
        EmailSender,
      );
      return res
        .status(HTTP_STATUSES.CREATED_201)
        .json({ message: interfaceMappers.toViewUser(result) });
    },
  );
  router.post(
    '/login',
    middlewares.validationLoginUserMiddleware,
    // sharedMiddlewares.validationTokenMiddleware,  было для теста обработчика.
    async (
      req: RequestWithBody<LoginUserInput>,
      res: Response<{
        message: {
          token: string;
          login: string;
        };
      }>,
    ) => {
      const authResult = await useCases.loginUser(
        userRepositoryMongo,
        req.body,
        jwtTokenService,
      );

      const AccessToken = authResult.AccessToken;
      const RefreshToken = authResult.RefreshToken;

      const response = {
        token: AccessToken,
        login: authResult.User.login,
      };
      return res
        .status(HTTP_STATUSES.OK_200)
        .cookie('refreshToken', RefreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          path: '/user',
        })
        .send({ message: response });
    },
  );
  router.post(
    '/refresh',
    async (
      req: RequestWithCookie<{ refreshToken: string }>,
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
          path: '/user',
        })
        .send({ message: AccessToken });
    },
  );
  router.get(
    '/verify',
    middlewares.validationVerifyUserMiddleware,
    // нужно вставить middleware, чтобы не делать raw и etc.
    async (
      req: RequestWithQuery<VerifyUserInput>,
      res: Response<{ message: boolean }>,
    ) => {
      const raw = req.query.code;
      const code = Array.isArray(raw) ? raw[0] : raw;

      const result = await useCases.verifyUser(userRepositoryMongo, code);
      return res.status(HTTP_STATUSES.OK_200).send({ message: result });
    },
  );
  router.get(
    '/users',
    //middleware,
    async (req: Request, res: Response<{ message: UserViewModel[] }>) => {
      const result = await useCases.getAllUsers(userRepositoryMongo);
      const view = result.map(interfaceMappers.toViewUser);
      return res.status(HTTP_STATUSES.OK_200).send({ message: view });
    },
  );
  router.delete(
    '/delete/:id',
    middlewares.validationIdUserMiddleware,
    async (
      req: RequestWithParams<IdParams>,
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
    async (
      req: RequestWithCookie<{ refreshToken: string }>,
      res: Response<{ message: boolean }>,
    ) => {
      const result = await useCases.logoutUser(
        userRepositoryMongo,
        jwtTokenService,
        req.cookies?.refreshToken,
      );
      res.clearCookie('refreshToken', { path: '/user' });
      return res.status(HTTP_STATUSES.OK_200).send({ message: result });
    },
  );
};
