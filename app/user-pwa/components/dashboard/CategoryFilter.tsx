/**
 * CategoryFilter Component
 * 
 * Horizontal scrollable category chips with:
 * - All categories always visible (horizontal scroll)
 * - Active category highlighted in green
 * - "Show All" option (null = no filter)
 * - Smooth scrolling
 * - Mobile optimized
 */

'use client';

import React, { useRef } from 'react';

export interface CategoryFilterProps {
  categories: string[];                      // ["Sedan", "SUV", ...]
  activeCategory: string | null;             // "Sedan" or null (show all)
  onCategoryChange: (category: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (category: string | null) => {
    onCategoryChange(category);
  };

  return (
    <div className="bg-white py-4 px-4 border-b border-slate-200">
      <div className="max-w-2xl mx-auto">
        {/* Label */}
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
          Filter by Category
        </p>

        {/* Horizontal Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scroll-smooth"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch', // Momentum scrolling on iOS
          }}
        >
          {/* "Show All" Option */}
          <button
            onClick={() => handleCategoryClick(null)}
            className={`shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
              activeCategory === null
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
            }`}
            aria-pressed={activeCategory === null}
          >
            All
          </button>

          {/* Category Chips */}
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
              }`}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Optional: Scroll Hint (visible only on mobile if not scrolled to end) */}
        <p className="text-xs text-slate-400 mt-2 text-center md:hidden">
          ← Swipe to see more →
        </p>
      </div>

      {/* Hide scrollbar but allow scrolling */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
        div {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryFilter;