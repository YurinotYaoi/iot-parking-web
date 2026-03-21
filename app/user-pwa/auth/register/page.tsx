/**
 * Register Page
 * 
 * User registration page for the FlexPark app
 * Handles user sign-up with email and password
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '../../components/auth/RegisterForm';
import { registerUser } from '@/lib/authService';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleRegisterSubmit = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    setApiError('');

    try {
      // Use mock auth service for UI testing
      const result = registerUser(data);

      if (!result.success) {
        throw new Error(result.message || 'Failed to create account');
      }

      // Registration successful
      console.log('Registration successful:', result.user);

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/user-pwa/auth/login');
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      setApiError(errorMessage);
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    router.push('/user-pwa/auth/login');
  };

  return (
    <div className="w-full">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Create Account</h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Join FlexPark and start finding parking easily
        </p>
      </div>

      {apiError && (
        <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs sm:text-sm text-red-700 font-medium">{apiError}</p>
        </div>
      )}

      <RegisterForm
        onSubmit={handleRegisterSubmit}
        onNavigateToLogin={handleNavigateToLogin}
        isLoading={isLoading}
      />
    </div>
  );
}
