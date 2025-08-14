// src/components/common/CreditCostDisplay.tsx
import React from 'react';
import { APPROX_INR_PER_CREDIT } from '../../lib/constants';
import { useAppStore } from '../../state/appStore';

interface CreditCostDisplayProps {
  cost: number;
  className?: string;
}

export const CreditCostDisplay: React.FC<CreditCostDisplayProps> = ({ cost, className }) => {
  const { currentUser } = useAppStore();

  if (cost === 0 || currentUser?.role === 'owner') return null;
  
  const inrValue = (cost * APPROX_INR_PER_CREDIT).toFixed(0);
  
  return (
    <div className={`text-xs bg-black/30 px-2 py-0.5 rounded-full flex items-center gap-2 whitespace-nowrap ${className}`}>
      <span>{cost} Cr</span>
      <span className="text-slate-400">(≈ ₹{inrValue})</span>
    </div>
  );
};