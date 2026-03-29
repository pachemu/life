import { ObjectId } from 'mongodb';
import type {
  NutritionDbModel,
  CreateNutritionDbModel,
  UpdateNutritionDbModel,
} from './types/nutrition.db.model.js';
import { Nutrition } from '../domain/nutrition.entity.js';
import type {
  CreateDailyNutritionInput,
  UpdateDailyNutritionInput,
} from '../domain/nutrition.repository.js';

const getCalories = (
  fats: number,
  carbs: number,
  protein: number,
  calories?: number,
): number => {
  return calories ?? fats * 9 + carbs * 4 + protein * 4;
};

const toDomain = (dbModel: NutritionDbModel): Nutrition => {
  let nutrition = new Nutrition(
    dbModel._id.toString(),
    dbModel.ownerId,
    dbModel.date,
    dbModel.calories,
    dbModel.fats,
    dbModel.carbs,
    dbModel.protein,
  );
  return nutrition;
};

const toCreateDb = (
  ownerId: string,
  input: CreateDailyNutritionInput,
): CreateNutritionDbModel => {
  let nutrition = {
    ownerId,
    date: input.date,
    calories: getCalories(
      input.fats,
      input.carbs,
      input.protein,
      input.calories,
    ),
    fats: input.fats,
    carbs: input.carbs,
    protein: input.protein,
  };
  return nutrition;
};

const toUpdateDb = (
  input: UpdateDailyNutritionInput,
): UpdateNutritionDbModel => {
  let nutrition: UpdateNutritionDbModel = {};
  if (input.date !== undefined) nutrition.date = input.date;
  if (input.calories !== undefined) nutrition.calories = input.calories;
  if (input.fats !== undefined) nutrition.fats = input.fats;
  if (input.carbs !== undefined) nutrition.carbs = input.carbs;
  if (input.protein !== undefined) nutrition.protein = input.protein;
  return nutrition;
};

const toDb = (nutrition: Nutrition): NutritionDbModel => {
  let nutritionDb = {
    _id: new ObjectId(nutrition.id),
    ownerId: nutrition.ownerId,
    date: nutrition.date,
    calories: getCalories(
      nutrition.fats,
      nutrition.carbs,
      nutrition.protein,
      nutrition.calories,
    ),
    fats: nutrition.fats,
    carbs: nutrition.carbs,
    protein: nutrition.protein,
  };
  return nutritionDb;
};

export const nutritionMapper = {
  toDomain,
  toCreateDb,
  toUpdateDb,
  toDb,
};
