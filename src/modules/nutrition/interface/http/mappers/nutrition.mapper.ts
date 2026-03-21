import type { Nutrition } from '../../../domain/nutrition.entity.js';
import type { NutritionViewModel } from '../routes/nutrition.routes.types.js';

const nutritionToView = (nutrition: Nutrition): NutritionViewModel => {
  return {
    date: nutrition.date,
    calories: nutrition.calories,
    fats: nutrition.fats,
    carbs: nutrition.carbs,
    protein: nutrition.protein,
  };
};

export default nutritionToView;
