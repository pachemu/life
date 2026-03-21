import type { Request } from 'express';

export type NutritionViewModel = {
  date: string;
  calories: number;
  fats: number;
  carbs: number;
  protein: number;
};

export type UserNutritionViewModel = {
  nutritions: NutritionViewModel[];
};

export type NutritionDateParams = {
  date: string;
};

export type CreateNutritionDayBody = {
  date: string;
  calories: number;
  fats: number;
  protein: number;
  carbs: number;
};

export type DeleteNutritionParams = NutritionDateParams;

export type UpdateNutritionBody = Partial<CreateNutritionDayBody>;

export type UpdateNutritionParams = NutritionDateParams;

export type NutritionQuery = {
  date?: string;
};

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithQuery<T> = Request<{}, {}, {}, T>;
export type RequestWithParams<T> = Request<T>;
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>;
