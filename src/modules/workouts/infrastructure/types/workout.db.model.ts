import type { ObjectId } from 'mongodb';

export type WorkoutSetDbModel = {
  reps: number;
  weight: number;
  rpe?: number;
};

export type WorkoutExerciseDbModel = {
  name: string;
  muscleGroup?: string;
  sets: WorkoutSetDbModel[];
  tonnage: number;
};

export type WorkoutDbModel = {
  _id: ObjectId;
  ownerId: string;
  date: string;
  notes?: string;
  exercises: WorkoutExerciseDbModel[];
  tonnage: number;
};

export type CreateWorkoutDbModel = Omit<WorkoutDbModel, '_id'>;
export type UpdateWorkoutDbModel = Partial<CreateWorkoutDbModel>;
