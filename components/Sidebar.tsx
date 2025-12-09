import React from 'react';
import { ShoppingItem, DietaryFilter } from '../types';
import { Trash2, Plus, ShoppingCart, Filter, Check } from 'lucide-react';

interface SidebarProps {
  filters: DietaryFilter[];
  activeFilters: DietaryFilter[];
  toggleFilter: (filter: DietaryFilter) => void;
  shoppingList: ShoppingItem[];
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  addShoppingItem: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  filters,
  activeFilters,
  toggleFilter,
  shoppingList,
  toggleShoppingItem,
  removeShoppingItem,
  addShoppingItem
}) => {
  const [newItemName, setNewItemName] = React.useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      addShoppingItem(newItemName.trim());
      setNewItemName('');
    }
  };

  return (
    <div className="w-full md:w-80 bg-white border-r border-slate-200 h-full flex flex-col shadow-sm z-10">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
          <span className="text-3xl">🥦</span> FridgeChef
        </h1>
        <p className="text-slate-500 text-sm mt-1">Your AI Culinary Assistant</p>
      </div>

      {/* Filters Section */}
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter size={16} /> Dietary Filters
        </h2>
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                activeFilters.includes(filter)
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Shopping List Section */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShoppingCart size={16} /> Shopping List
        </h2>
        
        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="mb-4 relative">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add item..."
            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
          <button 
            type="submit"
            disabled={!newItemName.trim()}
            className="absolute right-1 top-1 p-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={14} />
          </button>
        </form>

        {/* List Items */}
        <div className="space-y-2 flex-1">
          {shoppingList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 italic text-sm">
              List is empty. Add missing ingredients from recipes!
            </div>
          ) : (
            shoppingList.map(item => (
              <div 
                key={item.id} 
                className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    onClick={() => toggleShoppingItem(item.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      item.checked 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 text-transparent hover:border-emerald-400'
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </button>
                  <span className={`text-sm truncate ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {item.name} <span className="text-slate-400 text-xs">{item.amount ? `(${item.amount})` : ''}</span>
                  </span>
                </div>
                <button
                  onClick={() => removeShoppingItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
