'use client';

import React from 'react';
import { AuthProvider } from '@/lib/authContext';
import { ErrorProvider } from '@/contexts/ErrorContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <ErrorProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}