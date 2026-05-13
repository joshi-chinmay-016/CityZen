/*
Owned by Person 4
MODULE: Root Layout
*/

import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Navbar from '../components/common/Navbar';
import ToasterProvider from '../components/common/ToasterProvider';

export const metadata: Metadata = {
  title: 'CityZen',
  description: 'City intelligence dashboard for safer urban mobility.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#050505] text-white">
        <ToasterProvider />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
