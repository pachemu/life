type NutritionMacros = {
  fats?: number;
  carbs?: number;
  protein?: number;
};

export class Nutrition {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public readonly date: string,
    public calories: number | undefined,
    public fats: number,
    public carbs: number,
    public protein: number,
  ) {
    if (calories === undefined) {
      this.recalculateCalories();
    } else {
      this.calories = calories;
    }
  }

  private recalculateCalories() {
    this.calories = this.fats * 9 + this.protein * 4 + this.carbs * 4;
  }

  addMacros(data: NutritionMacros) {
    if (data.fats !== undefined) {
      this.fats += data.fats;
    }

    if (data.carbs !== undefined) {
      this.carbs += data.carbs;
    }

    if (data.protein !== undefined) {
      this.protein += data.protein;
    }

    this.recalculateCalories();
  }

  updateDetails(data: NutritionMacros) {
    if (data.fats !== undefined) {
      this.fats = data.fats;
    }

    if (data.carbs !== undefined) {
      this.carbs = data.carbs;
    }

    if (data.protein !== undefined) {
      this.protein = data.protein;
    }

    this.recalculateCalories();
  }
}
