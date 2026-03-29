import { errors } from '../../../shared/errors.js';
import { Nutrition } from '../domain/nutrition.entity.js';
import type {
  NutritionRepository,
  CreateDailyNutritionInput,
  UpdateDailyNutritionInput,
  NutritionQuery,
} from '../domain/nutrition.repository.js';

const getNutritionList = async (
  repo: NutritionRepository,
  ownerId: string,
  query: NutritionQuery,
) => {
  return repo.findByQuery(ownerId, query);
};

const getNutritionByDate = async (
  repo: NutritionRepository,
  ownerId: string,
  date: string,
) => {
  const nutrition = await repo.findByDate(date, ownerId);
  if (!nutrition) throw new errors.NotFoundError('Nutrition not found');
  return nutrition;
};

const createDailyNutrition = async (
  repo: NutritionRepository,
  ownerId: string,
  nutritionData: CreateDailyNutritionInput,
) => {
  const nutrition = new Nutrition(
    'temp',
    ownerId,
    nutritionData.date,
    nutritionData.calories,
    nutritionData.fats,
    nutritionData.carbs,
    nutritionData.protein,
  );

  const existingNutrition = await repo.findByDate(nutritionData.date, ownerId);
  if (existingNutrition) {
    throw new errors.AppError(409, 'Nutrition for this date already exists');
  }

  const dataForCreate: CreateDailyNutritionInput = {
    ...nutritionData,
    ...(nutrition.calories !== undefined
      ? { calories: nutrition.calories }
      : {}),
  };

  return repo.create(ownerId, dataForCreate);
};

const deleteNutrition = async (
  repo: NutritionRepository,
  ownerId: string,
  nutritionDate: string,
) => {
  let nutrition = await repo.findByDate(nutritionDate, ownerId);
  if (!nutrition) throw new errors.NotFoundError('Nutrition not found');
  let result = await repo.delete(nutrition.date, ownerId);
  return result;
};

const updateDailyNutrition = async (
  repo: NutritionRepository,
  ownerId: string,
  nutritionDate: string,
  nutritionData: UpdateDailyNutritionInput,
) => {
  let nutrition = await repo.findByDate(nutritionDate, ownerId);
  if (!nutrition) throw new errors.NotFoundError('Nutrition not found');
  nutrition.updateDetails(nutritionData);

  const dataForUpdate: UpdateDailyNutritionInput = {
    ...nutritionData,
    ...(nutrition.calories !== undefined
      ? { calories: nutrition.calories }
      : {}),
  };

  let result = await repo.update(nutrition.date, ownerId, dataForUpdate);
  return result;
};

export const useCases = {
  getNutritionList,
  getNutritionByDate,
  deleteNutrition,
  createDailyNutrition,
  updateDailyNutrition,
};
