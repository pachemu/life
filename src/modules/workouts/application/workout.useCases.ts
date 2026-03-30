import { AppError, errors } from '../../../shared/errors.js';
import { HTTP_STATUSES } from '../../../shared/HTTP_STATUSES.js';
import { Workout } from '../domain/workout.entity.js';
import type {
  CreateWorkoutInput,
  UpdateWorkoutInput,
  WorkoutQuery,
  WorkoutRepository,
} from '../domain/workout.repository.js';

const getWorkouts = async (
  repo: WorkoutRepository,
  ownerId: string,
  query: WorkoutQuery,
) => {
  const workouts = await repo.findByQuery(ownerId, query);
  return workouts;
};

const getWorkoutById = async (
  repo: WorkoutRepository,
  ownerId: string,
  workoutId: string,
) => {
  const workout = await repo.findById(ownerId, workoutId);
  if (!workout) throw new errors.NotFoundError('Workout not found');
  return workout;
};

const createWorkout = async (
  repo: WorkoutRepository,
  ownerId: string,
  workoutData: CreateWorkoutInput,
) => {
  const workout = new Workout(
    'temp',
    ownerId,
    workoutData.date,
    workoutData.notes,
    workoutData.exercises,
  );

  return repo.create(workout);
};

const deleteWorkout = async (
  repo: WorkoutRepository,
  ownerId: string,
  workoutId: string,
) => {
  const workout = await repo.findById(ownerId, workoutId);
  if (!workout) throw new errors.NotFoundError('Workout not found');
  let result = await repo.delete(workout.id, ownerId);
  return result;
};

const deleteAllWorkouts = async (repo: WorkoutRepository, ownerId: string) => {
  return repo.deleteAll(ownerId);
};

const updateWorkout = async (
  repo: WorkoutRepository,
  ownerId: string,
  workoutId: string,
  workoutData: UpdateWorkoutInput,
) => {
  let workout = await repo.findById(ownerId, workoutId);
  if (!workout) throw new errors.NotFoundError('Workout not found');
  try {
    workout.updateDetails(workoutData);
  } catch (e) {
    throw new AppError(
      HTTP_STATUSES.BAD_REQUEST_400,
      'couldnt update workout, check your query',
    );
  }

  return await repo.update(workout);
};
export const useCases = {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  deleteWorkout,
  deleteAllWorkouts,
  updateWorkout,
};
