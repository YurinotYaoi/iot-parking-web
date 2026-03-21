/**
 * AuthInput Component
 * 
 * Reusable input field for authentication forms (Login & Register)
 * Features:
 * - Password visibility toggle
 * - Real-time validation feedback
 * - Error messages
 * - Accessibility support (labels, ARIA)
 * - Responsive design with Tailwind
 */

'use client';

import React, { useState, forwardRef } from 'react';

export interface AuthInputProps {
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  pattern?: string;
  maxLength?: number;
  minLength?: number;
  showPasswordToggle?: boolean;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      label,
      type = 'text',
      placeholder = '',
      value,
      onChange,
      onBlur,
      error = '',
      success = false,
      disabled = false,
      required = false,
      autoComplete = 'off',
      pattern = '',
      maxLength,
      minLength,
      showPasswordToggle = false,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = `auth-input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    const inputType =
      type === 'password' && showPasswordToggle && showPassword ? 'text' : type;

    return (
      <div className="w-full mb-4 sm:mb-5">
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2 transition-colors"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            pattern={pattern}
            maxLength={maxLength}
            minLength={minLength}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`
              w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base
              border-2 transition-all duration-200
              text-slate-900 placeholder-slate-400
              focus:outline-none focus:ring-0
              disabled:bg-slate-100 disabled:cursor-not-allowed
              
              ${
                error
                  ? 'border-red-500 focus:border-red-600 bg-red-50'
                  : success
                    ? 'border-green-500 focus:border-green-600 bg-green-50'
                    : 'border-slate-300 focus:border-blue-500 bg-white'
              }
            `}
          />

          {/* Password Toggle Button */}
          {type === 'password' && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={disabled}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clipRule="evenodd"
                  />
                  <path d="M15.171 13.576l1.414 1.414A10.027 10.027 0 0019.542 10c-1.274-4.057-5.064-7-9.542-7a9.972 9.972 0 00-3.516.597l2.096 2.096a4 4 0 015.45 5.45z" />
                </svg>
              )}
            </button>
          )}

          {/* Success Icon */}
          {success && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p id={`${inputId}-error`} className="text-xs sm:text-sm text-red-600 mt-1 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;
