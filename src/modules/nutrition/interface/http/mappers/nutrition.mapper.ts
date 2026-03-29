import type { Nutrition } from '../../../domain/nutrition.entity.js';
import type { NutritionViewModel } from '../routes/nutrition.routes.types.js';

const getCalories = (
  fats: number,
  carbs: number,
  protein: number,
  calories?: number,
): number => {
  return calories ?? fats * 9 + carbs * 4 + protein * 4;
};

const nutritionToView = (nutrition: Nutrition): NutritionViewModel => {
  return {
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
};

export default nutritionToView;
