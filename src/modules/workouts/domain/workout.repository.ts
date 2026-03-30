import type { Workout, WorkoutExercise } from './workout.entity.js';

export type CreateWorkoutInput = {
  date: string;
  notes?: string;
  exercises: WorkoutExercise[];
};

export type WorkoutQuery = {
  date?: string;
  muscleGroup?: string;
};

export type UpdateWorkoutInput = {
  date?: string;
  notes?: string;
  exercises?: WorkoutExercise[];
};

export interface WorkoutRepository {
  findByQuery(ownerId: string, query: WorkoutQuery): Promise<Workout[]>;
  findById(ownerId: string, workoutId: string): Promise<Workout | null>;
  create(workout: Workout): Promise<Workout>;
  update(workout: Workout): Promise<Workout>;
  delete(id: string, ownerId: string): Promise<boolean>;
  deleteAll(ownerId: string): Promise<boolean>;
}
