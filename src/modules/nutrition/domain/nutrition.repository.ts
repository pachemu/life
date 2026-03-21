import type { Nutrition } from './nutrition.entity.js';

export type CreateDailyNutritionInput = {
  date: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
};

export type UpdateDailyNutritionInput = Partial<CreateDailyNutritionInput>;

export type NutritionQuery = {
  date?: string;
};

export interface NutritionRepository {
  findAll(ownerId: string): Promise<Nutrition[]>;
  findByQuery(ownerId: string, query: NutritionQuery): Promise<Nutrition[]>;
  findByDate(date: string, ownerId: string): Promise<Nutrition | null>;
  create(ownerId: string, data: CreateDailyNutritionInput): Promise<Nutrition>;
  update(
    date: string,
    ownerId: string,
    data: UpdateDailyNutritionInput,
  ): Promise<Nutrition>;
  delete(date: string, ownerId: string): Promise<boolean>;
  deleteAll(ownerId: string): Promise<boolean>;
}
