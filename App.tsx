import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { RecipeCard } from './components/RecipeCard';
import { CookingMode } from './components/CookingMode';
import { analyzeFridgeAndGetRecipes, fileToGenerativePart } from './services/geminiService';
import { Recipe, Ingredient, ShoppingItem, DietaryFilter } from './types';
import { Camera, Upload, Loader2, ChefHat, Sparkles } from 'lucide-react';

const DIETARY_OPTIONS: DietaryFilter[] = ['Vegetarian', 'Vegan', 'Keto', 'Gluten-Free', 'Dairy-Free', 'High-Protein'];

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [activeFilters, setActiveFilters] = useState<DietaryFilter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile state

  // Helper to manage shopping list
  const addShoppingItem = (name: string, amount: string = '') => {
    setShoppingList(prev => [
      ...prev,
      { id: Date.now().toString() + Math.random(), name, amount, checked: false }
    ]);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const toggleFilter = (filter: DietaryFilter) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const base64Data = await fileToGenerativePart(file);
      const generatedRecipes = await analyzeFridgeAndGetRecipes(base64Data, file.type, activeFilters);
      setRecipes(generatedRecipes);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please try again with a clearer photo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Hidden on mobile by default */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-20 h-full`}>
        <Sidebar 
          filters={DIETARY_OPTIONS}
          activeFilters={activeFilters}
          toggleFilter={toggleFilter}
          shoppingList={shoppingList}
          toggleShoppingItem={toggleShoppingItem}
          removeShoppingItem={removeShoppingItem}
          addShoppingItem={addShoppingItem}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
            <ChefHat size={24} />
          </button>
          <span className="font-bold text-emerald-600">FridgeChef</span>
          <div className="w-8" /> {/* Spacer */}
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Hero / Upload Section */}
            {!recipes.length && !isLoading && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in">
                <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 mb-4 animate-bounce-slow">
                   <Sparkles size={48} />
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
                  What's in your fridge?
                </h2>
                <p className="text-lg text-slate-500 max-w-xl">
                  Upload a photo of your open fridge or pantry. Our AI will identify ingredients and suggest delicious recipes tailored to your diet.
                </p>
                
                <div className="flex gap-4 items-center mt-8">
                  <label className="cursor-pointer group relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                    <div className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all group-hover:bg-emerald-600">
                       <Upload size={20} />
                       <span>Upload Photo</span>
                    </div>
                  </label>
                  
                  <span className="text-slate-400 text-sm font-medium">or</span>
                   
                  <label className="cursor-pointer group relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                    <div className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all">
                       <Camera size={20} />
                       <span>Take Photo</span>
                    </div>
                  </label>
                </div>

                {activeFilters.length > 0 && (
                   <p className="text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
                      Active Filters: {activeFilters.join(', ')}
                   </p>
                )}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
                <Loader2 size={64} className="text-emerald-500 animate-spin" />
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">Analyzing your ingredients...</h3>
                  <p className="text-slate-500">Creating custom recipes based on what we found.</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
                {error}
                <button 
                  onClick={() => setError(null)}
                  className="block mx-auto mt-2 text-sm underline hover:text-red-800"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Recipe Grid */}
            {recipes.length > 0 && (
              <div className="animate-fade-in-up">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Suggested Recipes</h2>
                    <label className="cursor-pointer text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-2">
                       <Camera size={16} />
                       Analyze Another Photo
                       <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload} 
                          className="hidden" 
                        />
                    </label>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {recipes.map(recipe => (
                      <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        onSelect={setActiveRecipe}
                        onAddIngredient={(name, amount) => addShoppingItem(name, amount)}
                      />
                    ))}
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Full Screen Cooking Mode */}
      {activeRecipe && (
        <CookingMode 
          recipe={activeRecipe} 
          onClose={() => setActiveRecipe(null)} 
        />
      )}
    </div>
  );
}

export default App;
