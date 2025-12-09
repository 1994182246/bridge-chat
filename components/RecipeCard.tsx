import React from 'react';
import { Recipe, Ingredient } from '../types';
import { Clock, Flame, ChefHat, PlusCircle } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onAddIngredient: (name: string, amount: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect, onAddIngredient }) => {
  const missingCount = recipe.ingredientsMissing.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full group">
        {/* Placeholder Image Header - In a real app we might ask AI for an image or use a stock API, here using abstract pattern */}
        <div className="h-32 bg-gradient-to-br from-emerald-50 to-teal-100 relative p-4 flex flex-col justify-end">
             <div className="absolute top-4 right-4 flex gap-1 flex-wrap justify-end">
                {recipe.dietaryTags.slice(0, 2).map(tag => (
                    <span key={tag} className="bg-white/90 backdrop-blur text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                        {tag}
                    </span>
                ))}
             </div>
             <h3 className="font-bold text-xl text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
                {recipe.title}
             </h3>
        </div>

        <div className="p-5 flex-1 flex flex-col">
            {/* Meta Data */}
            <div className="flex items-center gap-4 text-slate-500 text-xs font-medium mb-4">
                <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {recipe.prepTimeMinutes}m
                </div>
                <div className="flex items-center gap-1">
                    <Flame size={14} />
                    {recipe.calories} kcal
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                    recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                }`}>
                    <ChefHat size={14} />
                    {recipe.difficulty}
                </div>
            </div>

            <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">
                {recipe.description}
            </p>

            {/* Missing Ingredients */}
            {missingCount > 0 && (
                <div className="mb-4 bg-orange-50 rounded-lg p-3 border border-orange-100">
                    <p className="text-orange-800 text-xs font-bold mb-2 flex justify-between">
                        <span>Missing Ingredients ({missingCount})</span>
                    </p>
                    <div className="space-y-1">
                        {recipe.ingredientsMissing.slice(0, 3).map((ing, i) => (
                            <div key={i} className="flex items-center justify-between text-xs text-orange-900/80">
                                <span>{ing.name}</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddIngredient(ing.name, ing.amount);
                                    }}
                                    title="Add to shopping list"
                                    className="text-orange-600 hover:text-orange-800 hover:bg-orange-200 rounded p-0.5 transition-colors"
                                >
                                    <PlusCircle size={14} />
                                </button>
                            </div>
                        ))}
                        {missingCount > 3 && (
                            <span className="text-[10px] text-orange-600 italic">+{missingCount - 3} more...</span>
                        )}
                    </div>
                </div>
            )}

            <button 
                onClick={() => onSelect(recipe)}
                className="w-full mt-auto py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
            >
                Start Cooking
            </button>
        </div>
    </div>
  );
};
