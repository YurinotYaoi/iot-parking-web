/**
 * Mock Auth Service for UI Testing
 * 
 * When backend is ready, replace these functions with real API calls.
 * All interfaces and exports remain the same for seamless integration.
 */

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const USERS_STORAGE_KEY = 'flexpark_users'; // All registered users
const AUTH_STORAGE_KEY = 'flexpark_auth'; // Current session

/**
 * Register a new user (mock - using localStorage)
 * 
 * When backend ready: Replace with POST /api/auth/register
 */
export const registerUser = (userData: {
  name: string;
  email: string;
  password: string;
}): { success: boolean; message: string; user?: User } => {
  try {
    // Get existing users
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    // Check if email already exists
    if (users.some((u) => u.email === userData.email)) {
      return { success: false, message: 'Email already registered' };
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
    };

    // Save user
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Also store password as key-value for login (not in user object)
    const passwordsJson = localStorage.getItem('flexpark_passwords');
    const passwords: Record<string, string> = passwordsJson ? JSON.parse(passwordsJson) : {};
    passwords[userData.email] = userData.password;
    localStorage.setItem('flexpark_passwords', JSON.stringify(passwords));

    console.log('[Auth] User registered:', userData.email);

    return { success: true, message: 'Registration successful', user: newUser };
  } catch (error) {
    return { success: false, message: 'Registration failed' };
  }
};

/**
 * Login user (mock - using localStorage)
 * 
 * When backend ready: Replace with POST /api/auth/login
 */
export const loginUser = (credentials: {
  email: string;
  password: string;
}): { success: boolean; message: string; user?: User; token?: string } => {
  try {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    // Find user by email
    const user = users.find((u) => u.email === credentials.email);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Verify password
    const passwordsJson = localStorage.getItem('flexpark_passwords');
    const passwords: Record<string, string> = passwordsJson ? JSON.parse(passwordsJson) : {};

    if (passwords[credentials.email] !== credentials.password) {
      return { success: false, message: 'Invalid password' };
    }

    // Create mock token
    const token = btoa(`${user.id}:${user.email}:${Date.now()}`);

    // Save auth session
    const authState: AuthState = {
      user,
      token,
      isAuthenticated: true,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));

    console.log('[Auth] User logged in:', credentials.email);

    return {
      success: true,
      message: 'Login successful',
      user,
      token,
    };
  } catch (error) {
    return { success: false, message: 'Login failed' };
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
  try {
    const authJson = localStorage.getItem(AUTH_STORAGE_KEY);
    const auth: AuthState = authJson ? JSON.parse(authJson) : null;
    return auth?.user || null;
  } catch {
    return null;
  }
};

/**
 * Get auth token
 */
export const getAuthToken = (): string | null => {
  try {
    const authJson = localStorage.getItem(AUTH_STORAGE_KEY);
    const auth: AuthState = authJson ? JSON.parse(authJson) : null;
    return auth?.token || null;
  } catch {
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  try {
    const authJson = localStorage.getItem(AUTH_STORAGE_KEY);
    const auth: AuthState = authJson ? JSON.parse(authJson) : null;
    return auth?.isAuthenticated || false;
  } catch {
    return false;
  }
};

/**
 * Logout user
 */
export const logoutUser = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    console.log('[Auth] User logged out');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
