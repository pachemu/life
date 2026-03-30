import type { Request } from 'express';

export type WorkoutSetViewModel = {
  reps: number;
  weight: number;
  rpe?: number;
};

export type WorkoutExerciseViewModel = {
  name: string;
  muscleGroup?: string;
  sets: WorkoutSetViewModel[];
  tonnage: number;
};

export type WorkoutViewModel = {
  id: string;
  date: string;
  notes?: string;
  exercises: WorkoutExerciseViewModel[];
  tonnage: number;
};

export type WorkoutIdParams = {
  id: string;
};

export type CreateWorkoutBody = {
  date: string;
  notes?: string;
  exercises: {
    name: string;
    muscleGroup?: string;
    sets: {
      reps: number;
      weight: number;
      rpe?: number;
    }[];
  }[];
};

export type UpdateWorkoutBody = Partial<CreateWorkoutBody>;
export type UpdateWorkoutParams = WorkoutIdParams;
export type DeleteWorkoutParams = WorkoutIdParams;

export type WorkoutQuery = {
  date?: string;
  muscleGroup?: string;
};

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithQuery<T> = Request<{}, {}, {}, T>;
export type RequestWithParams<T> = Request<T>;
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>;
