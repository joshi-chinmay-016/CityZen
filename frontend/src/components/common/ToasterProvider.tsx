'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#0f172a',
          color: '#fff',
          border: '1px solid #1e293b',
        },
      }}
    />
  );
}
