/**
 * Auth Layout
 * 
 * Wrapper layout for authentication pages (login/register)
 * Provides consistent styling and structure for auth forms
 * Fully mobile responsive
 */

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4 py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-1 sm:mb-2 tracking-tight">
            FlexPark
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">Smart Parking Solutions</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-6 sm:p-8 md:p-10 w-full">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center text-xs text-slate-500">
          <p>© 2024 FlexPark. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
