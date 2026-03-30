import type { Router, Response } from 'express';
import { errors } from '../../../../../shared/errors.js';
import { HTTP_STATUSES } from '../../../../../shared/HTTP_STATUSES.js';
import { authMiddleware } from '../../../../auth/interface/auth.middleware.js';
import { useCases } from '../../../application/workout.useCases.js';
import type { WorkoutRepository } from '../../../domain/workout.repository.js';
import workoutToView from '../mappers/workout.mapper.js';
import { middlewares } from '../middlewares/workout.middleware.js';
import type {
  CreateWorkoutBody,
  DeleteWorkoutParams,
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
  UpdateWorkoutBody,
  UpdateWorkoutParams,
  WorkoutIdParams,
  WorkoutQuery,
  WorkoutViewModel,
} from './workout.routes.types.js';

const getOwnerId = (userId: string | undefined): string => {
  if (!userId) {
    throw new errors.AppError(HTTP_STATUSES.UNATHORIZED_401, 'Invalid token');
  }
  return userId;
};

export const getWorkoutRouter = (
  router: Router,
  workoutRepositoryMongo: WorkoutRepository,
) => {
  router.get(
    '/',
    authMiddleware,
    async (
      req: RequestWithQuery<WorkoutQuery>,
      res: Response<{ message: WorkoutViewModel[] }>,
    ) => {
      const result = await useCases.getWorkouts(
        workoutRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.query,
      );
      return res
        .status(HTTP_STATUSES.OK_200)
        .json({ message: result.map(workoutToView) });
    },
  );

  router.get(
    '/:id',
    authMiddleware,
    middlewares.validationIdWorkoutMiddleware,
    async (
      req: RequestWithParams<WorkoutIdParams>,
      res: Response<{ message: WorkoutViewModel }>,
    ) => {
      const result = await useCases.getWorkoutById(
        workoutRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.params.id,
      );
      return res
        .status(HTTP_STATUSES.OK_200)
        .json({ message: workoutToView(result) });
    },
  );

  router.post(
    '/',
    authMiddleware,
    middlewares.validationCreateWorkoutMiddleware,
    async (
      req: RequestWithBody<CreateWorkoutBody>,
      res: Response<{ message: WorkoutViewModel }>,
    ) => {
      const result = await useCases.createWorkout(
        workoutRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.body,
      );
      return res
        .status(HTTP_STATUSES.CREATED_201)
        .json({ message: workoutToView(result) });
    },
  );

  router.delete(
    '/:id',
    authMiddleware,
    middlewares.validationIdWorkoutMiddleware,
    async (
      req: RequestWithParams<DeleteWorkoutParams>,
      res: Response<{ message: boolean }>,
    ) => {
      const result = await useCases.deleteWorkout(
        workoutRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.params.id,
      );
      return res.status(HTTP_STATUSES.OK_200).json({ message: result });
    },
  );

  router.delete(
    '/',
    authMiddleware,
    async (req, res: Response<{ message: boolean }>) => {
      const result = await useCases.deleteAllWorkouts(
        workoutRepositoryMongo,
        getOwnerId(req.user?.userId),
      );
      return res.status(HTTP_STATUSES.OK_200).json({ message: result });
    },
  );

  router.put(
    '/:id',
    authMiddleware,
    middlewares.validationUpdateWorkoutMiddleware,
    middlewares.validationIdWorkoutMiddleware,
    async (
      req: RequestWithParamsAndBody<UpdateWorkoutParams, UpdateWorkoutBody>,
      res: Response<{ message: WorkoutViewModel }>,
    ) => {
      const result = await useCases.updateWorkout(
        workoutRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.params.id,
        req.body,
      );
      return res
        .status(HTTP_STATUSES.OK_200)
        .json({ message: workoutToView(result) });
    },
  );
};
