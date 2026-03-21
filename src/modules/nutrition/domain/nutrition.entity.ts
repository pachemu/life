import { AppError } from '../../../shared/errors.js';

type NutritionUpdate = {
  date?: string;
  calories?: number;
  fats?: number;
  carbs?: number;
  protein?: number;
};

const assertNonNegative = (value: number, field: string) => {
  if (value < 0) {
    throw new AppError(400, `${field} cannot be negative`);
  }
};

export class Nutrition {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public date: string,
    public calories: number,
    public fats: number,
    public carbs: number,
    public protein: number,
  ) {
    if (!date.trim()) {
      throw new AppError(400, 'Date is required');
    }
    assertNonNegative(calories, 'Calories');
    assertNonNegative(fats, 'Fats');
    assertNonNegative(carbs, 'Carbs');
    assertNonNegative(protein, 'Protein');
  }

  // updateNutritionFacts(pages: number) {
  //   if (pages < 0 || pages > this.carbs) {
  //     throw new AppError(400, 'Invalid page number');
  //   }
  //   this.fat = pages;
  // }
  updateDetails(data: NutritionUpdate) {
    if (data.date !== undefined) {
      if (!data.date.trim()) {
        throw new AppError(400, 'Date is required');
      }
      this.date = data.date;
    }
    if (data.calories !== undefined) this.calories = data.calories;
    if (data.fats !== undefined) this.fats = data.fats;
    if (data.carbs !== undefined) this.carbs = data.carbs;
    if (data.protein !== undefined) this.protein = data.protein;

    assertNonNegative(this.calories, 'Calories');
    assertNonNegative(this.fats, 'Fats');
    assertNonNegative(this.carbs, 'Carbs');
    assertNonNegative(this.protein, 'Protein');
  }
}
