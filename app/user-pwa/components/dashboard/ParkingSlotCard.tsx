/**
 * ParkingSlotCard Component
 * 
 * Displays a single parking spot with:
 * - Location name
 * - Status (Open/Full) with color coding
 * - Distance from user
 * - Price per hour
 * - "OPEN" button to view details
 * 
 * Reusable across dashboard and search results
 */

'use client';

import React from 'react';
import Button from '../common/Button';

export interface ParkingSpot {
  id: string;
  name: string;
  category: string;
  status: 'OPEN' | 'FULL';
  distance: number;              // in kilometers
  rate: number | 'FREE';         // cost in ₱ or 'FREE'
  address?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
}

export interface ParkingSlotCardProps {
  spot: ParkingSpot;
  onOpenClick: (spotId: string) => void; // Navigate to location details
}

const ParkingSlotCard: React.FC<ParkingSlotCardProps> = ({ spot, onOpenClick }) => {
  // Format the rate display
  const formatRate = (rate: number | 'FREE'): string => {
    if (rate === 'FREE') {
      return 'Free';
    }
    return `₱${rate}`;
  };

  // Determine status color
  const statusColor = spot.status === 'OPEN' 
    ? 'bg-green-50 text-green-700 border-green-200' 
    : 'bg-red-50 text-red-700 border-red-200';

  const statusDot = spot.status === 'OPEN' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow active:shadow-sm">
      {/* Top Row: Location Name + Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {/* Location Name */}
          <h3 className="text-base font-semibold text-slate-900 truncate">
            {spot.name}
          </h3>
          {/* Category Badge */}
          <p className="text-xs text-slate-500 mt-1">
            {spot.category}
          </p>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium shrink-0 ${statusColor}`}>
          <span className={`w-2 h-2 rounded-full ${statusDot}`} />
          {spot.status}
        </div>
      </div>

      {/* Middle Row: Details (Distance, Rate) */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        {/* Distance */}
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{spot.distance}km</span>
        </div>

        {/* Rate */}
        <div className="text-sm font-medium text-slate-900">
          {formatRate(spot.rate)}
        </div>

        {/* Address (optional, truncated) */}
        {spot.address && (
          <p className="text-xs text-slate-500 truncate flex-1 text-right">
            {spot.address}
          </p>
        )}
      </div>

      {/* Bottom Row: Open Button */}
      <button
        onClick={() => onOpenClick(spot.id)}
        className="w-full bg-green-500 text-white font-semibold py-2.5 rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
      >
        View Details
      </button>

      {/* Optional: Amenities (if available) */}
      {spot.amenities && spot.amenities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-600 mb-2">Amenities:</p>
          <div className="flex flex-wrap gap-2">
            {spot.amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingSlotCard;