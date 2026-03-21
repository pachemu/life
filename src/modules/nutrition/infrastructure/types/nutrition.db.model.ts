import type { ObjectId } from 'mongodb';

export type NutritionDbModel = {
  _id: ObjectId;
  ownerId: string;
  date: string;
  calories: number;
  fats: number;
  carbs: number;
  protein: number;
};

export type CreateNutritionDbModel = {
  ownerId: string;
  date: string;
  calories: number;
  fats: number;
  carbs: number;
  protein: number;
};

export type UpdateNutritionDbModel = Partial<
  Omit<CreateNutritionDbModel, 'ownerId'>
>;
