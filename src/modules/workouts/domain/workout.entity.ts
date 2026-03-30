export type WorkoutSet = {
  reps: number;
  weight: number;
  rpe?: number;
};
export type WorkoutExercise = {
  name: string;
  muscleGroup?: string;
  sets: WorkoutSet[];
  tonnage?: number;
};

export type WorkoutUpdate = {
  date?: string;
  exercises?: WorkoutExercise[];
  notes?: string;
};

export class Workout {
  public tonnage = 0;
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public date: string,
    public notes: string | undefined,
    public exercises: WorkoutExercise[],
  ) {
    this.recalculateTonnage();
  }

  private recalculateTonnage() {
    this.tonnage = this.exercises.reduce((workoutSum, exercise) => {
      const exerciseTonnage = exercise.sets.reduce(
        (setSum, set) => setSum + set.weight * set.reps,
        0,
      );

      exercise.tonnage = exerciseTonnage;
      return workoutSum + exerciseTonnage;
    }, 0);
  }

  updateDetails(data: WorkoutUpdate) {
    if (data.date !== undefined) this.date = data.date;
    if (data.exercises !== undefined) this.exercises = data.exercises;
    if (data.notes !== undefined) this.notes = data.notes;
    this.recalculateTonnage();
  }
}
