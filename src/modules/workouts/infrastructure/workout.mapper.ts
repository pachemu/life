import { ObjectId } from 'mongodb';
import { Workout } from '../domain/workout.entity.js';
import type { CreateWorkoutInput } from '../domain/workout.repository.js';
import type {
  CreateWorkoutDbModel,
  UpdateWorkoutDbModel,
  WorkoutDbModel,
  WorkoutExerciseDbModel,
  WorkoutSetDbModel,
} from './types/workout.db.model.js';

const calculateExerciseTonnage = (
  exercise: CreateWorkoutInput['exercises'][number],
): number => {
  return exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
};

const toDbSet = (
  set: CreateWorkoutInput['exercises'][number]['sets'][number],
): WorkoutSetDbModel => {
  return {
    reps: set.reps,
    weight: set.weight,
    ...(set.rpe !== undefined ? { rpe: set.rpe } : {}),
  };
};

const normalizeExercises = (
  exercises: CreateWorkoutInput['exercises'],
): WorkoutExerciseDbModel[] => {
  return exercises.map((exercise) => ({
    name: exercise.name,
    ...(exercise.muscleGroup !== undefined
      ? { muscleGroup: exercise.muscleGroup }
      : {}),
    sets: exercise.sets.map(toDbSet),
    tonnage: calculateExerciseTonnage(exercise),
  }));
};

const toDomainSet = (
  set: WorkoutDbModel['exercises'][number]['sets'][number],
) => {
  return {
    reps: set.reps,
    weight: set.weight,
    ...(set.rpe !== undefined ? { rpe: set.rpe } : {}),
  };
};

const toDomain = (dbModel: WorkoutDbModel): Workout => {
  return new Workout(
    dbModel._id.toString(),
    dbModel.ownerId,
    dbModel.date,
    dbModel.notes,
    dbModel.exercises.map((exercise) => ({
      name: exercise.name,
      ...(exercise.muscleGroup !== undefined
        ? { muscleGroup: exercise.muscleGroup }
        : {}),
      sets: exercise.sets.map(toDomainSet),
      tonnage: exercise.tonnage,
    })),
  );
};

const toCreateDb = (workout: Workout): CreateWorkoutDbModel => {
  const exercises = normalizeExercises(workout.exercises);

  return {
    ownerId: workout.ownerId,
    date: workout.date,
    exercises,
    tonnage: exercises.reduce((sum, exercise) => sum + exercise.tonnage, 0),
    ...(workout.notes !== undefined ? { notes: workout.notes } : {}),
  };
};

const toDb = (workout: Workout): WorkoutDbModel => {
  return {
    _id: new ObjectId(workout.id),
    ownerId: workout.ownerId,
    date: workout.date,
    exercises: workout.exercises.map((exercise) => ({
      name: exercise.name,
      ...(exercise.muscleGroup !== undefined
        ? { muscleGroup: exercise.muscleGroup }
        : {}),
      sets: exercise.sets.map(toDbSet),
      tonnage: exercise.tonnage ?? 0,
    })),
    tonnage: workout.tonnage,
    ...(workout.notes !== undefined ? { notes: workout.notes } : {}),
  };
};

export const workoutMapper = {
  toDomain,
  toCreateDb,
  toDb,
};
