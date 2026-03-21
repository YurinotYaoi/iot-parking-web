/**
 * Navbar Component
 * 
 * Displays at the top of the dashboard with:
 * - User greeting ("My Name")
 * - Settings button (gear icon)
 * - Fixed positioning (stays at top while scrolling)
 * - Mobile optimized with safe area support
 */

'use client';

import React from 'react';

export interface NavbarProps {
  userName: string;           // "John Doe" - from auth context
  onSettingsClick: () => void; // Navigate to settings page
}

const Navbar: React.FC<NavbarProps> = ({ userName, onSettingsClick }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 safe-area-inset-top">
      {/* Container with max-width and padding */}
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left: User Greeting */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-slate-900">
            {userName}
          </h1>
          <p className="text-xs text-slate-500">Dashboard</p>
        </div>

        {/* Right: Logout Button */}
        <button
          onClick={onSettingsClick}
          className="ml-4 p-2.5 rounded-lg hover:bg-slate-100 transition-colors active:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          aria-label="Logout"
          title="Logout"
        >
          {/* Exit/Logout Icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-700"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 3l7 7-7 7M23 10H9" />
          </svg>
        </button>
      </div>

      {/* Safe area for notch (top padding) */}
      <style jsx>{`
        @supports (padding: max(0px)) {
          nav {
            padding-top: max(1rem, env(safe-area-inset-top));
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;