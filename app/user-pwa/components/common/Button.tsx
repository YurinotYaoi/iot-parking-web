/**
 * Button Component
 * 
 * Reusable button with multiple variants and states
 * Features:
 * - Multiple variants (primary, secondary, danger, ghost)
 * - Multiple sizes (sm, md, lg)
 * - Loading state
 * - Disabled state
 * - Full width option
 */

'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs sm:text-sm font-medium',
      md: 'px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium',
      lg: 'px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-semibold',
    };

    // Variant styles
    const variantStyles = {
      primary:
        'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300',
      secondary:
        'bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400 disabled:bg-slate-100',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-300',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center
          rounded-lg transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:cursor-not-allowed opacity-disabled
          
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
