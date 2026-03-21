/**
 * Form Validation Utilities
 * 
 * Functions to validate user inputs in real-time
 * Used for both Register and Login forms
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns ValidationResult with error message if invalid
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
  
};

/**
 * Validates name field
 * @param name - User name to validate
 * @returns ValidationResult with error message if invalid
 */
export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.length < 3) {
    return { isValid: false, error: 'Name must be at least 3 characters' };
  }

  if (name.length > 50) {
    return { isValid: false, error: 'Name must not exceed 50 characters' };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns ValidationResult with error message if invalid
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password must not exceed 128 characters' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  return { isValid: true };
};

/**
 * Validates that passwords match
 * @param password - First password
 * @param confirmPassword - Password confirmation
 * @returns ValidationResult with error message if invalid
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

/**
 * Check if entire form is valid
 * @param formData - Form data object
 * @returns boolean indicating if form is valid
 */
export const isFormValid = (formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): boolean => {
  const nameValid = validateName(formData.name).isValid;
  const emailValid = validateEmail(formData.email).isValid;
  const passwordValid = validatePassword(formData.password).isValid;
  
  if (formData.confirmPassword !== undefined) {
    const confirmPasswordValid = validatePasswordMatch(formData.password, formData.confirmPassword).isValid;
    return nameValid && emailValid && passwordValid && confirmPasswordValid;
  }
  
  return nameValid && emailValid && passwordValid;
};
