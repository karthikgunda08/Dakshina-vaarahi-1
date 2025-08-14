// src/components/GlobalSpinner.tsx
import React from 'react';
import { LoadingSpinner } from './common/LoadingSpinner';

export const GlobalSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-[9999]">
      <LoadingSpinner size="h-16 w-16" color="text-sky-400" />
      <p className="text-white mt-4 text-lg font-semibold animate-pulse">{message}</p>
    </div>
  );
};
