import { AppError } from '../../../shared/errors.js';

type NutritionMacros = {
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
    public readonly date: string,
    public calories: number,
    public fats: number,
    public carbs: number,
    public protein: number,
  ) {
    if (!date.trim()) {
      throw new AppError(400, 'Date is required');
    }

    assertNonNegative(fats, 'Fats');
    assertNonNegative(carbs, 'Carbs');
    assertNonNegative(protein, 'Protein');

    this.recalculateCalories();
  }

  private recalculateCalories() {
    this.calories = this.fats * 9 + this.protein * 4 + this.carbs * 4;
  }

  addMacros(data: NutritionMacros) {
    if (data.fats !== undefined) {
      assertNonNegative(data.fats, 'Fats');
      this.fats += data.fats;
    }

    if (data.carbs !== undefined) {
      assertNonNegative(data.carbs, 'Carbs');
      this.carbs += data.carbs;
    }

    if (data.protein !== undefined) {
      assertNonNegative(data.protein, 'Protein');
      this.protein += data.protein;
    }

    this.recalculateCalories();
  }

  updateDetails(data: NutritionMacros) {
    if (data.fats !== undefined) {
      assertNonNegative(data.fats, 'Fats');
      this.fats = data.fats;
    }

    if (data.carbs !== undefined) {
      assertNonNegative(data.carbs, 'Carbs');
      this.carbs = data.carbs;
    }

    if (data.protein !== undefined) {
      assertNonNegative(data.protein, 'Protein');
      this.protein = data.protein;
    }

    this.recalculateCalories();
  }
}
