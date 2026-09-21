"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FaArrowLeft } from "react-icons/fa6";

export default function SettingsPage() {

    useEffect(() => {
    document.title = "Settings";
  }, []);

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({ firstName: '', lastName: '', middleName: '', email: '', password: '' });

  type FormErrors = {
    firstName?: string;
    lastName?: string;
    email?: string;
    form?: string;
  };
  const [errors, setErrors] = useState<FormErrors>({});
  const clearFieldError = (field: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  useEffect(() => {
    // First, try to get user data from localStorage and set it immediately
    const authData = JSON.parse(localStorage.getItem('flexpark_auth') || '{}');
    if (authData.user) {
      setUser({
        firstName: authData.user.firstName || '',
        lastName: authData.user.lastName || '',
        middleName: authData.user.middleName || '',
        email: authData.user.email || '',
        password: authData.user.password || ''
      });
    }

    // Then fetch fresh data from API
    const fetchUser = async () => {
      try {
        const token = authData.token;
        
        console.log('Auth data:', authData);
        console.log('Token exists:', !!token);

        if (!token) {
          console.log('No token found, redirecting to login');
          router.push('/auth/login');
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await response.json();
        console.log('API response status:', response.status);
        console.log('User data from API:', result);
        
        if (response.ok && result.success) {
          const data = result.data;
          setUser(prev => ({ 
            firstName: data.firstName || prev.firstName, 
            lastName: data.lastName || prev.lastName, 
            middleName: data.middleName || prev.middleName, 
            email: data.email || prev.email, 
            password: prev.password // Keep existing password
          }));
        } else if (response.status === 401) {
          console.error('Unauthorized - redirecting to login');
          router.push('/auth/login');
        } else {
          console.error('Error fetching user:', result.error);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newErrors: FormErrors = {};
    if (!user.firstName.trim()) newErrors.firstName = "First name is required";
    if (!user.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!user.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
      newErrors.email = "Enter a valid email address";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    const authData = JSON.parse(localStorage.getItem('flexpark_auth') || '{}');
    const token = authData.token;
    const uid = authData.user?.uid;

    if (!uid) {
      setErrors({ form: 'User ID not found' });
      setIsLoading(false);
      return;
    }

    const response = await fetch(`/api/users/${uid}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        email: user.email,
        password: user.password,
      }),
    });
    const data = await response.json();
    if (response.ok && data.success) {
      // Update localStorage with new user data including password
      localStorage.setItem('flexpark_auth', JSON.stringify({ token, user: { ...data.data, password: user.password } }));
      toast.success('Profile updated successfully');
      router.push('/dashboard');
    } else {
      setErrors({ form: data.error || 'Failed to update profile' });
    }
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-slate-50/70 dark:bg-slate-950">
      <div className="flex w-screen max-w-6xl flex-col px-4 py-6">
        <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="mb-4 inline-flex items-center rounded-lg border border-transparent bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-white hover:text-slate-900   hover:ring-1 hover:ring-slate-300 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
        <form onSubmit={handleSubmit}>
          {errors.form && (
            <p className="mb-4 flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <span aria-hidden="true">⚠</span> {errors.form}
            </p>
          )}

          <div className="mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.firstName ? "border-destructive" : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"}`}
              placeholder={user.firstName || "First Name"}
              value={user.firstName}
              aria-invalid={!!errors.firstName}
              onChange={(event) => { setUser({ ...user, firstName: event.target.value }); clearFieldError("firstName"); }}
            />
            {errors.firstName && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-destructive">
                <span aria-hidden="true">⚠</span> {errors.firstName}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
              Middle Name
            </label>
            <input
              type="text"
              name="middleName"
              id="middleName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={user.middleName || "Middle Name"}
              value={user.middleName}
              onChange={(event) => setUser({ ...user, middleName: event.target.value })}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.lastName ? "border-destructive" : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"}`}
              placeholder={user.lastName || "Last Name"}
              value={user.lastName}
              aria-invalid={!!errors.lastName}
              onChange={(event) => { setUser({ ...user, lastName: event.target.value }); clearFieldError("lastName"); }}
            />
            {errors.lastName && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-destructive">
                <span aria-hidden="true">⚠</span> {errors.lastName}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.email ? "border-destructive" : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"}`}
              placeholder={user.email || "Email"}
              value={user.email}
              aria-invalid={!!errors.email}
              onChange={(event) => { setUser({ ...user, email: event.target.value }); clearFieldError("email"); }}
            />
            {errors.email && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-destructive">
                <span aria-hidden="true">⚠</span> {errors.email}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={user.password || "Password"}
              value={user.password}
              onChange={(event) => setUser({ ...user, password: event.target.value })}
            />
          </div>
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center rounded-lg border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Save
            </button>
            <button
              type="button"
              className="ml-3 inline-flex justify-center rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
        </div>
      </div>
    </main>
  );
} 