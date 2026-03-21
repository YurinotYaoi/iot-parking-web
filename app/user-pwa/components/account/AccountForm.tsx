/**
 * AccountForm Component
 * 
 * Complete account management form with:
 * - Edit profile (name, email)
 * - Change password
 * - Delete account confirmation
 * - Firebase integration ready
 * - Real-time validation
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import AuthInput from '../auth/AuthInput';
import Button from '../common/Button';
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from '@/lib/validators';

export interface AccountFormProps {
  userName: string;
  userEmail: string;
  onSave?: (data: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
  onDelete?: (password: string) => Promise<void>;
  onCancel?: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const AccountForm: React.FC<AccountFormProps> = ({
  userName,
  userEmail,
  onSave,
  onDelete,
  onCancel,
}) => {
  // Form State
  const [formData, setFormData] = useState({
    name: userName,
    email: userEmail,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Detect if form has changes
  const hasChanges = useMemo(() => {
    return (
      formData.name !== userName ||
      formData.email !== userEmail ||
      formData.currentPassword !== '' ||
      formData.newPassword !== '' ||
      formData.confirmPassword !== ''
    );
  }, [formData, userName, userEmail]);

  // Validate field
  const validateField = useCallback(
    (field: keyof typeof formData, value: string): string => {
      switch (field) {
        case 'name':
          return validateName(value).error || '';
        case 'email':
          return validateEmail(value).error || '';
        case 'currentPassword':
          // Current password just needs to exist if changing password
          if (formData.newPassword && !value) {
            return 'Current password required to change password';
          }
          return '';
        case 'newPassword':
          // Only validate if user is changing password
          if (value) {
            return validatePassword(value).error || '';
          }
          return '';
        case 'confirmPassword':
          if (formData.newPassword && !value) {
            return 'Please confirm your new password';
          }
          if (formData.newPassword) {
            return validatePasswordMatch(formData.newPassword, value).error || '';
          }
          return '';
        default:
          return '';
      }
    },
    [formData.newPassword]
  );

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

  // Handle blur
  const handleBlur = useCallback(
    (field: keyof typeof formData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField]
  );

  // Validate entire form
  const isFormValid = useMemo(() => {
    const nameValid = validateName(formData.name).isValid;
    const emailValid = validateEmail(formData.email).isValid;

    // If trying to change password, validate password fields
    if (formData.newPassword) {
      const currentPasswordValid = !!formData.currentPassword;
      const newPasswordValid = validatePassword(formData.newPassword).isValid;
      const confirmValid = validatePasswordMatch(
        formData.newPassword,
        formData.confirmPassword
      ).isValid;
      return (
        nameValid &&
        emailValid &&
        currentPasswordValid &&
        newPasswordValid &&
        confirmValid
      );
    }

    // Otherwise just validate profile fields
    return nameValid && emailValid;
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {
      name: validateName(formData.name).error || '',
      email: validateEmail(formData.email).error || '',
    };

    if (formData.newPassword) {
      newErrors.currentPassword =
        formData.currentPassword === ''
          ? 'Current password required'
          : '';
      newErrors.newPassword = validatePassword(formData.newPassword).error || '';
      newErrors.confirmPassword = validatePasswordMatch(
        formData.newPassword,
        formData.confirmPassword
      ).error || '';
    }

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    if (!isFormValid) {
      setGeneralError('Please fix the errors above');
      return;
    }

    setIsLoading(true);
    setGeneralError('');
    setSuccessMessage('');

    try {
      if (onSave) {
        await onSave({
          name: formData.name !== userName ? formData.name : undefined,
          email: formData.email !== userEmail ? formData.email : undefined,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        });

        setSuccessMessage('Account updated successfully!');
        // Reset password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update account';
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete account
  const handleDeleteConfirm = async () => {
    if (!deletePassword) {
      setGeneralError('Password required to delete account');
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      if (onDelete) {
        await onDelete(deletePassword);
        // Ondelete should handle redirect
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete account';
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Error Message */}
      {generalError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 mb-6 animate-in fade-in">
          <svg
            className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-red-700 font-medium">{generalError}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 mb-6 animate-in fade-in">
          <svg
            className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-green-700 font-medium">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Section */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Profile Information
          </h2>

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
            minLength={3}
            maxLength={50}
          />

          <AuthInput
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(value) => handleChange('email', value)}
            onBlur={() => handleBlur('email')}
            error={touched.email ? errors.email : ''}
            success={touched.email && !errors.email && formData.email !== ''}
            required
          />
        </div>

        {/* Password Change Section */}
        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Change Password
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Leave blank to keep your current password
          </p>

          <AuthInput
            label="Current Password"
            type="password"
            placeholder="Enter your current password"
            value={formData.currentPassword}
            onChange={(value) => handleChange('currentPassword', value)}
            onBlur={() => handleBlur('currentPassword')}
            error={touched.currentPassword ? errors.currentPassword : ''}
            showPasswordToggle
            autoComplete="current-password"
          />

          {formData.currentPassword && (
            <>
              <AuthInput
                label="New Password"
                type="password"
                placeholder="Create a strong password"
                value={formData.newPassword}
                onChange={(value) => handleChange('newPassword', value)}
                onBlur={() => handleBlur('newPassword')}
                error={touched.newPassword ? errors.newPassword : ''}
                showPasswordToggle
                autoComplete="new-password"
              />

              <AuthInput
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter your new password"
                value={formData.confirmPassword}
                onChange={(value) => handleChange('confirmPassword', value)}
                onBlur={() => handleBlur('confirmPassword')}
                error={touched.confirmPassword ? errors.confirmPassword : ''}
                showPasswordToggle
                autoComplete="new-password"
              />
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-200 pt-8 flex gap-3">
          {/* Save Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={!hasChanges || isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>

          {/* Cancel Button */}
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>

        {/* Delete Account Section */}
        <div className="border-t border-slate-200 pt-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-base font-semibold text-red-900 mb-2">
              Delete Account
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Permanently delete your FleXpark account and all associated data. This action
              cannot be undone.
            </p>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
              className="w-full"
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Account?
            </h3>
            <p className="text-sm text-slate-600">
              This action is permanent and cannot be undone. All your data will be deleted
              immediately.
            </p>

            {/* Password Verification */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter your password to confirm:
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:outline-none text-slate-900"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                }}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                isLoading={isLoading}
                onClick={handleDeleteConfirm}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountForm;