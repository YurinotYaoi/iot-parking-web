/**
 * app/(user-pwa)/account/edit/page.tsx
 * 
 * Account settings page where users can:
 * - Edit name and email
 * - Change password
 * - Delete their account
 * - Navigate back to dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AccountForm from '../../components/account/AccountForm';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Guest');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize: Get current user data
  useEffect(() => {
    const initializeAccount = async () => {
      try {
        // TODO: Get user from Firebase auth
        // const user = auth.currentUser;
        // setUserName(user?.displayName || 'Guest');
        // setUserEmail(user?.email || '');

        // For now, use sample data
        setUserName('John Doe');
        setUserEmail('john@example.com');
      } catch (err) {
        console.error('Failed to load account:', err);
      }
    };

    initializeAccount();
  }, []);

  // Handle save changes
  const handleSave = async (data: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    try {
      setIsLoading(true);

      // TODO: Implement Firebase updates
      // 1. If name changed:
      //    await updateProfile(auth.currentUser, { displayName: data.name });
      //
      // 2. If email changed:
      //    await updateEmail(auth.currentUser, data.email);
      //
      // 3. If password changed:
      //    const credential = EmailAuthProvider.credential(
      //      auth.currentUser.email,
      //      data.currentPassword
      //    );
      //    await reauthenticateWithCredential(auth.currentUser, credential);
      //    await updatePassword(auth.currentUser, data.newPassword);

      // For now, simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state
      if (data.name) {
        setUserName(data.name);
      }
      if (data.email) {
        setUserEmail(data.email);
      }

      console.log('Account updated:', data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete account
  const handleDelete = async (password: string) => {
    try {
      setIsLoading(true);

      // TODO: Implement Firebase account deletion
      // 1. Re-authenticate user with password:
      //    const credential = EmailAuthProvider.credential(
      //      auth.currentUser.email,
      //      password
      //    );
      //    await reauthenticateWithCredential(auth.currentUser, credential);
      //
      // 2. Delete user account:
      //    await deleteUser(auth.currentUser);
      //
      // 3. Delete user data from Firestore (Kervin's job):
      //    await deleteDoc(doc(db, 'users', auth.currentUser.uid));
      //
      // 4. Sign out and redirect:
      //    await signOut(auth);
      //    router.push('/auth/login');

      // For now, simulate deletion
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In real app, would be signed out and redirected by Firebase
      router.push('/auth/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Deletion failed';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors mb-4"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-600 mt-2">
            Manage your profile, security, and account preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AccountForm
          userName={userName}
          userEmail={userEmail}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={handleCancel}
        />
      </div>

   
    </div>
  );
}