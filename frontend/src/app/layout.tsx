/*
Owned by Person 4
MODULE: Root Layout
*/

import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'CityZen',
  description: 'City intelligence dashboard for safer urban mobility.',
};

type RootLayoutProps = {
  children: ReactNode;
};

import Navbar from '../components/common/Navbar';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-[#050505] text-white">
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #1e293b',
          }
        }} />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
