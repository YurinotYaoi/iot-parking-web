/**
 * app/(user-pwa)/dashboard/page.tsx
 * 
 * Main Dashboard page that:
 * - Displays user's name (from auth)
 * - Shows category filter
 * - Renders parking spots list
 * - Manages selected category state
 * - Handles navigation to location details
 * - Ready for Firebase integration
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/dashboard/Navbar';
import CategoryFilter from '../components/dashboard/CategoryFilter';
import SlotsList from '../components/dashboard/SlotsList';
import { ParkingSpot } from '../components/dashboard/ParkingSlotCard';
import { getCurrentUser, logoutUser, isAuthenticated } from '@/lib/authService';

// CATEGORIES (from wireframe)
const CATEGORIES = [
  'Sedan',
  'SUV',
  'Pickup Truck',
  'Delivery Trucks',
  'PWD',
  'Emergency',
];

// SAMPLE DATA (for testing without Firebase)
// Replace this with Firebase query when ready
const SAMPLE_PARKING_SPOTS: ParkingSpot[] = [
  {
    id: '1',
    name: '7/11',
    category: 'Sedan',
    status: 'OPEN',
    distance: 4,
    rate: 'FREE',
    address: '123 Main St, Bacoor',
    latitude: 14.3667,
    longitude: 120.9167,
    amenities: ['CCTV', 'Restroom'],
  },
  {
    id: '2',
    name: 'Alphamart',
    category: 'SUV',
    status: 'FULL',
    distance: 6,
    rate: 'FREE',
    address: '456 Oak Ave, Bacoor',
    latitude: 14.3750,
    longitude: 120.9250,
    amenities: ['CCTV'],
  },
  {
    id: '3',
    name: 'SM Bacoor',
    category: 'Pickup Truck',
    status: 'FULL',
    distance: 4,
    rate: 40,
    address: '789 Shopping Blvd, Bacoor',
    latitude: 14.3600,
    longitude: 120.9100,
    amenities: ['CCTV', 'Restroom', 'EV Charging'],
  },
  {
    id: '4',
    name: 'MetroBank',
    category: 'Sedan',
    status: 'OPEN',
    distance: 4,
    rate: 40,
    address: '321 Bank Ave, Bacoor',
    latitude: 14.3580,
    longitude: 120.9050,
    amenities: ['CCTV', 'Security Guard'],
  },
  {
    id: '5',
    name: 'Dali Parking',
    category: 'SUV',
    status: 'FULL',
    distance: 4,
    rate: 'FREE',
    address: '555 Shopping District, Bacoor',
    latitude: 14.3650,
    longitude: 120.9150,
    amenities: ['CCTV', 'Restroom', 'Water Station'],
  },
  {
    id: '6',
    name: 'Robinsons Bacoor',
    category: 'PWD',
    status: 'OPEN',
    distance: 2,
    rate: 'FREE',
    address: '777 Mall Complex, Bacoor',
    latitude: 14.3700,
    longitude: 120.9200,
    amenities: ['CCTV', 'Accessible', 'Restroom'],
  },
  {
    id: '7',
    name: 'Hospital Parking',
    category: 'Emergency',
    status: 'OPEN',
    distance: 1,
    rate: 'FREE',
    address: '999 Medical Center, Bacoor',
    latitude: 14.3620,
    longitude: 120.9080,
    amenities: ['CCTV', '24/7 Security'],
  },
  {
    id: '8',
    name: 'City Mall Parking',
    category: 'Delivery Trucks',
    status: 'FULL',
    distance: 8,
    rate: 60,
    address: '111 Downtown, Bacoor',
    latitude: 14.3750,
    longitude: 120.9300,
    amenities: ['CCTV', 'Loading Zone', 'EV Charging'],
  },
];

export default function DashboardPage() {
  const router = useRouter();

  // State
  const [userName, setUserName] = useState('Guest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>(SAMPLE_PARKING_SPOTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Initialize: Get user name from auth
  useEffect(() => {
    const initializeDashboard = () => {
      try {
        // Check if user is authenticated (runs only on client)
        const authenticated = isAuthenticated();
        
        if (!authenticated) {
          console.log('[Dashboard] User not authenticated, redirecting to login');
          router.push('/user-pwa/auth/login');
          return;
        }

        // Get current user from auth service
        const user = getCurrentUser();
        if (user) {
          console.log('[Dashboard] User found:', user.name);
          setUserName(user.name);
        }

        // TODO: Fetch parking spots from Firebase when ready
        // For now, using SAMPLE_PARKING_SPOTS
      } catch (err) {
        setError('Failed to load dashboard');
        console.error('Dashboard init error:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    // Small delay to ensure localStorage is ready
    const timer = setTimeout(initializeDashboard, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // Handle category change
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    // Optional: Fetch spots for this category from Firebase
    // const filteredSpots = await getParkingSpotsByCategory(category);
  };

  // Handle spot selection (navigate to details)
  const handleSpotSelect = (spotId: string) => {
    // Navigate to location details page
    router.push(`/user-pwa/dashboard/location/${spotId}`);
  };

  // Handle logout
  const handleSettingsClick = () => {
    logoutUser();
    router.push('/user-pwa/auth/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Show loading while checking auth */}
      {isCheckingAuth ? (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Navbar (Fixed) */}
          <Navbar userName={userName} onSettingsClick={handleSettingsClick} />

          {/* Navbar Spacer (accounts for fixed navbar) */}
          <div className="h-16 md:h-20" />

          {/* Main Content */}
          <div className="pb-8">
            {/* Category Filter */}
            <CategoryFilter
              categories={CATEGORIES}
              activeCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />

            {/* Parking Slots List */}
            <SlotsList
              spots={parkingSpots}
              selectedCategory={selectedCategory}
              isLoading={isLoading}
              onSpotSelect={handleSpotSelect}
              error={error}
            />
          </div>
        </>
      )}
    </div>
  );
}
