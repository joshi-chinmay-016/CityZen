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
      <body className="bg-[#050505] text-white">
        <ToasterProvider />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
