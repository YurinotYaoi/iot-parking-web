/**
 * Login Page
 * 
 * User login page for the FlexPark app
 * Handles user sign-in with email and password
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '../../components/auth/LoginForm';
import { loginUser } from '@/lib/authService';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleLoginSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setApiError('');

    try {
      // Use mock auth service for UI testing
      const result = loginUser(data);

      if (!result.success) {
        throw new Error(result.message || 'Failed to sign in');
      }

      // Login successful
      console.log('Login successful:', result.user);
      console.log('[Login] Auth state saved to localStorage');

      // Wait a bit to ensure localStorage is synced, then redirect
      await new Promise(resolve => setTimeout(resolve, 800));
      
      router.push('/user-pwa/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setApiError(errorMessage);
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  const handleNavigateToRegister = () => {
    router.push('/user-pwa/auth/register');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
        <p className="text-slate-600 text-sm">Sign in to your FlexPark account</p>
      </div>

      {apiError && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">{apiError}</p>
        </div>
      )}

      <LoginForm
        onSubmit={handleLoginSubmit}
        onNavigateToRegister={handleNavigateToRegister}
        isLoading={isLoading}
      />
    </div>
  );
}
