/**
 * SlotsList Component
 * 
 * Renders a vertical scrollable list of parking slots with:
 * - Filtering by category
 * - Individual ParkingSlotCards
 * - Loading state
 * - Empty state (no results)
 * - Animation on items
 */

'use client';

import React, { useMemo } from 'react';
import ParkingSlotCard, { ParkingSpot } from './ParkingSlotCard';

export interface SlotsListProps {
  spots: ParkingSpot[];
  selectedCategory: string | null;           // "Sedan" or null (show all)
  isLoading: boolean;
  onSpotSelect: (spotId: string) => void;
  error?: string;                            // Optional error message
}

const SlotsList: React.FC<SlotsListProps> = ({
  spots,
  selectedCategory,
  isLoading,
  onSpotSelect,
  error,
}) => {
  // Filter spots by selected category
  const filteredSpots = useMemo(() => {
    if (!selectedCategory) {
      return spots;
    }
    return spots.filter((spot) => spot.category === selectedCategory);
  }, [spots, selectedCategory]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="px-4 py-8 text-center">
        {/* Spinner */}
        <div className="flex justify-center mb-4">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin" />
        </div>
        <p className="text-slate-600 text-sm">Loading parking spots...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="px-4 py-8 bg-red-50 rounded-lg m-4 border border-red-200">
        <p className="text-red-700 text-sm font-medium">Error loading spots</p>
        <p className="text-red-600 text-xs mt-1">{error}</p>
      </div>
    );
  }

  // Render empty state
  if (filteredSpots.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mx-auto text-slate-300 mb-3"
        >
          <path d="M8 6h12M8 10h12M8 14h12M4 6v10a2 2 0 002 2h12a2 2 0 002-2V6" />
        </svg>
        <h3 className="text-slate-900 font-semibold mb-1">No spots found</h3>
        <p className="text-slate-600 text-sm">
          {selectedCategory
            ? `No ${selectedCategory} parking spots available in your area`
            : 'No parking spots available in your area'}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {/* Results Count */}
      <div className="text-xs text-slate-500 mb-4">
        {filteredSpots.length} {filteredSpots.length === 1 ? 'spot' : 'spots'} found
      </div>

      {/* Spots List */}
      <div className="space-y-3 pb-6">
        {filteredSpots.map((spot, index) => (
          <div
            key={spot.id}
            style={{
              animation: `fadeInUp 0.3s ease-out ${index * 50}ms backwards`,
            }}
          >
            <ParkingSlotCard spot={spot} onOpenClick={onSpotSelect} />
          </div>
        ))}
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SlotsList;