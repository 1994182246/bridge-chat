export interface Ingredient {
  name: string;
  amount: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
}

export interface Recipe {
  id: string; // generated locally
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTimeMinutes: number;
  calories: number;
  ingredientsAvailable: Ingredient[];
  ingredientsMissing: Ingredient[];
  steps: RecipeStep[];
  dietaryTags: string[];
}

export type DietaryFilter = 'Vegetarian' | 'Vegan' | 'Keto' | 'Gluten-Free' | 'Dairy-Free' | 'High-Protein';

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  checked: boolean;
}
