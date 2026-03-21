/**
 * User PWA Layout
 * 
 * Root layout for the user progressive web app
 */

import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'FlexPark - Smart Parking Solutions',
  description: 'Find and book parking spaces easily',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" >
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
