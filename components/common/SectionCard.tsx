// src/components/common/SectionCard.tsx
import React from 'react';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-slate-800/50 p-6 rounded-xl border border-slate-700 ${className}`}>
      <h3 className="text-xl font-bold text-sky-300 mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  );
};