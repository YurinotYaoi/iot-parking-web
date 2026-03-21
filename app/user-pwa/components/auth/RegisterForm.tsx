/**
 * RegisterForm Component
 * 
 * Complete sign-up form with:
 * - Real-time field validation
 * - Password strength feedback
 * - Form submission handling
 * - Loading states
 * - Error handling
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import AuthInput from './AuthInput';
import Button from '../common/Button';
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from '@/lib/validators';

export interface RegisterFormProps {
  onSubmit?: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onNavigateToLogin?: () => void;
  isLoading?: boolean;
}

/**
 * Password Strength Indicator Component
 */
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = (pwd: string): { level: number; label: string; color: string } => {
    let strength = 0;

    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength++;

    const levels = [
      { level: 0, label: '', color: '' },
      { level: 1, label: 'Weak', color: 'bg-red-500' },
      { level: 2, label: 'Fair', color: 'bg-orange-500' },
      { level: 3, label: 'Good', color: 'bg-yellow-500' },
      { level: 4, label: 'Strong', color: 'bg-lime-500' },
      { level: 5, label: 'Very Strong', color: 'bg-green-500' },
    ];

    return levels[strength];
  };

  if (!password) return null;

  const { level, label, color } = getStrength(password);

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= level ? color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      {label && (
        <p className={`text-xs font-medium ${color.replace('bg-', 'text-')}`}>
          Password Strength: {label}
        </p>
      )}
    </div>
  );
};

/**
 * Register Form Component
 */
const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onNavigateToLogin,
  isLoading: externalIsLoading = false,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Validation state
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Real-time validation
  const validateField = useCallback((field: keyof typeof formData, value: string) => {
    let error = '';

    switch (field) {
      case 'name':
        const nameValidation = validateName(value);
        error = nameValidation.error || '';
        break;
      case 'email':
        const emailValidation = validateEmail(value);
        error = emailValidation.error || '';
        break;
      case 'password':
        const passwordValidation = validatePassword(value);
        error = passwordValidation.error || '';
        break;
      case 'confirmPassword':
        const matchValidation = validatePasswordMatch(formData.password, value);
        error = matchValidation.error || '';
        break;
    }

    return error;
  }, [formData.password]);

  // Handle input change
  const handleChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Validate if field was touched
      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }

      // Clear general error on input change
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
    const nameValid = validateName(formData.name).isValid;
    const emailValid = validateEmail(formData.email).isValid;
    const passwordValid = validatePassword(formData.password).isValid;
    const confirmPasswordValid = validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    ).isValid;

    return nameValid && emailValid && passwordValid && confirmPasswordValid;
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    const allErrors = {
      name: validateName(formData.name).error || '',
      email: validateEmail(formData.email).error || '',
      password: validatePassword(formData.password).error || '',
      confirmPassword: validatePasswordMatch(
        formData.password,
        formData.confirmPassword
      ).error || '',
    };

    setErrors(allErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    // If validation fails, stop here
    if (!isFormValid) {
      setGeneralError('Please fix the errors above');
      return;
    }

    // Prepare to submit
    setIsLoading(true);
    setGeneralError('');
    setSuccessMessage('');

    try {
      if (onSubmit) {
        await onSubmit({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        // Success feedback
        setSuccessMessage('Account created successfully! Redirecting...');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create account. Please try again.';
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-6">
      {/* General Error Message */}
      {generalError && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3 animate-in fade-in duration-200">
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

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 sm:gap-3 animate-in fade-in duration-200">
          <svg
            className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs sm:text-sm text-green-700 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Name Field */}
      <AuthInput
        label="Full Name"
        type="text"
        placeholder="John Doe"
        value={formData.name}
        onChange={(value) => handleChange('name', value)}
        onBlur={() => handleBlur('name')}
        error={touched.name ? errors.name : ''}
        success={touched.name && !errors.name && formData.name !== ''}
        required
        autoComplete="name"
        minLength={3}
        maxLength={50}
      />

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
      <div>
        <AuthInput
          label="Password"
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={(value) => handleChange('password', value)}
          onBlur={() => handleBlur('password')}
          error={touched.password ? errors.password : ''}
          success={touched.password && !errors.password && formData.password !== ''}
          required
          showPasswordToggle
          autoComplete="new-password"
        />
        <PasswordStrengthIndicator password={formData.password} />
      </div>

      {/* Confirm Password Field */}
      <AuthInput
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your password"
        value={formData.confirmPassword}
        onChange={(value) => handleChange('confirmPassword', value)}
        onBlur={() => handleBlur('confirmPassword')}
        error={touched.confirmPassword ? errors.confirmPassword : ''}
        success={
          touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword !== ''
        }
        required
        showPasswordToggle
        autoComplete="new-password"
      />

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
        {isLoading || externalIsLoading ? 'Creating Account...' : 'Sign Up'}
      </Button>

      {/* Login Link */}
      <p className="text-center text-slate-600 text-xs sm:text-sm">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors underline"
        >
          Login here
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;
