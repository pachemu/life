import type { Workout } from '../../../domain/workout.entity.js';
import type { WorkoutViewModel } from '../routes/workout.routes.types.js';

const workoutToView = (workout: Workout): WorkoutViewModel => {
  return {
    id: workout.id,
    date: workout.date,
    exercises: workout.exercises.map((exercise) => ({
      name: exercise.name,
      ...(exercise.muscleGroup !== undefined
        ? { muscleGroup: exercise.muscleGroup }
        : {}),
      sets: exercise.sets.map((set) => ({
        reps: set.reps,
        weight: set.weight,
        ...(set.rpe !== undefined ? { rpe: set.rpe } : {}),
      })),
      tonnage: exercise.tonnage ?? 0,
    })),
    tonnage: workout.tonnage,
    ...(workout.notes !== undefined ? { notes: workout.notes } : {}),
  };
};

export default workoutToView;
