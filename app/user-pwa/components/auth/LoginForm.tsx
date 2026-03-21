/**
 * LoginForm Component
 * 
 * Sign-in form with:
 * - Email and password validation
 * - Loading states
 * - Error handling
 * - Remember me option
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import AuthInput from './AuthInput';
import Button from '../common/Button';
import { validateEmail, validatePassword } from '@/lib/validators';

export interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string }) => Promise<void>;
  onNavigateToRegister?: () => void;
  isLoading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onNavigateToRegister,
  isLoading: externalIsLoading = false,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Validate field
  const validateField = useCallback((field: keyof typeof formData, value: string) => {
    let error = '';

    switch (field) {
      case 'email':
        const emailValidation = validateEmail(value);
        error = emailValidation.error || '';
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        }
        break;
    }

    return error;
  }, []);

  // Handle input change
  const handleChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }

      if (generalError) {
        setGeneralError('');
      }
    },
    [touched, validateField, generalError]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field: keyof typeof formData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField]
  );

  // Check if form is valid
  const isFormValid = useMemo(() => {
    const emailValid = validateEmail(formData.email).isValid;
    const passwordValid = formData.password.length > 0;
    return emailValid && passwordValid;
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const allErrors = {
      email: validateEmail(formData.email).error || '',
      password: formData.password ? '' : 'Password is required',
    };

    setErrors(allErrors);
    setTouched({ email: true, password: true });

    if (!isFormValid) {
      setGeneralError('Please fix the errors above');
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      if (onSubmit) {
        await onSubmit({
          email: formData.email,
          password: formData.password,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to sign in. Please try again.';
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-6">
      {/* General Error Message */}
      {generalError && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3">
          <svg
            className="w-4 sm:w-5 h-4 sm:h-5 text-red-600 shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs sm:text-sm text-red-700 font-medium">{generalError}</p>
        </div>
      )}

      {/* Email Field */}
      <AuthInput
        label="Email Address"
        type="text"
        placeholder="you@example.com"
        value={formData.email}
        onChange={(value) => handleChange('email', value)}
        onBlur={() => handleBlur('email')}
        error={touched.email ? errors.email : ''}
        success={touched.email && !errors.email && formData.email !== ''}
        required
        autoComplete="email"
      />

      {/* Password Field */}
      <AuthInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={(value) => handleChange('password', value)}
        onBlur={() => handleBlur('password')}
        error={touched.password ? errors.password : ''}
        success={touched.password && !errors.password && formData.password !== ''}
        required
        showPasswordToggle
        autoComplete="current-password"
      />

      {/* Remember Me Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="remember-me"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="remember-me" className="text-xs sm:text-sm text-slate-600 cursor-pointer">
          Remember me
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading || externalIsLoading}
        disabled={!isFormValid || isLoading || externalIsLoading}
        fullWidth
        className="mt-6 sm:mt-8"
      >
        {isLoading || externalIsLoading ? 'Signing in...' : 'Sign In'}
      </Button>

      {/* Register Link */}
      <p className="text-center text-slate-600 text-xs sm:text-sm">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onNavigateToRegister}
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors underline"
        >
          Create one here
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
