import type { Router, Response } from 'express';
import { errors } from '../../../../../shared/errors.js';
import { HTTP_STATUSES } from '../../../../../shared/HTTP_STATUSES.js';
import { authMiddleware } from '../../../../auth/interface/auth.middleware.js';
import { useCases } from '../../../application/nutrition.useCases.js';
import type { NutritionRepository } from '../../../domain/nutrition.repository.js';
import nutritionToView from '../mappers/nutrition.mapper.js';
import { middlewares } from '../middlewares/nutrition.middleware.js';
import type {
  RequestWithQuery,
  NutritionQuery,
  NutritionViewModel,
  RequestWithParams,
  NutritionDateParams,
  RequestWithBody,
  CreateNutritionDayBody,
  DeleteNutritionParams,
  RequestWithParamsAndBody,
  UpdateNutritionParams,
  UpdateNutritionBody,
} from './nutrition.routes.types.js';

const getOwnerId = (userId: string | undefined): string => {
  if (!userId) {
    throw new errors.AppError(HTTP_STATUSES.UNATHORIZED_401, 'Invalid token');
  }
  return userId;
};

export const getNutritionRouter = (
  router: Router,
  nutritionRepositoryMongo: NutritionRepository,
) => {
  // Query запросы
  router.get(
    '/',
    authMiddleware,
    async (
      req: RequestWithQuery<NutritionQuery>,
      res: Response<{ message: NutritionViewModel[] }>,
    ) => {
      let result = await useCases.getNutritionList(
        nutritionRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.query,
      );
      let nutritionList = result.map(nutritionToView);
      return res.status(HTTP_STATUSES.OK_200).json({ message: nutritionList });
    },
  );
  router.get(
    '/:date',
    authMiddleware,
    middlewares.validationDateNutritionMiddleware,
    async (
      req: RequestWithParams<NutritionDateParams>,
      res: Response<{ message: NutritionViewModel }>,
    ) => {
      let result = await useCases.getNutritionByDate(
        nutritionRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.params.date,
      );
      let nutrition = nutritionToView(result);
      return res.status(HTTP_STATUSES.OK_200).json({ message: nutrition });
    },
  );
  // Commands запросы

  router.post(
    '/',
    authMiddleware,
    middlewares.validationCreateNutritionMiddleware,
    async (
      req: RequestWithBody<CreateNutritionDayBody>,
      res: Response<{ message: NutritionViewModel }>,
    ) => {
      let newDay = await useCases.createDailyNutrition(
        nutritionRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.body,
      );
      let nutrition = nutritionToView(newDay);
      return res.status(HTTP_STATUSES.CREATED_201).json({ message: nutrition });
    },
  );

  router.delete(
    '/:date',
    authMiddleware,
    middlewares.validationDateNutritionMiddleware,
    async (
      req: RequestWithParams<DeleteNutritionParams>,
      res: Response<{ message: boolean }>,
    ) => {
      const result = await useCases.deleteNutrition(
        nutritionRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.params.date,
      );
      return res.status(HTTP_STATUSES.OK_200).json({ message: result });
    },
  );

  router.put(
    '/:date',
    authMiddleware,
    middlewares.validationUpdateNutritionMiddleware,
    middlewares.validationDateNutritionMiddleware,
    async (
      req: RequestWithParamsAndBody<UpdateNutritionParams, UpdateNutritionBody>,
      res: Response<{ message: NutritionViewModel }>,
    ) => {
      let updatedDailyNutrition = await useCases.updateDailyNutrition(
        nutritionRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.params.date,
        req.body,
      );
      let nutrition = nutritionToView(updatedDailyNutrition);
      return res.status(HTTP_STATUSES.OK_200).json({ message: nutrition });
    },
  );
  //USER
};
