// src/components/icons/DakshinVaarahiLogo.tsx
import React from 'react';

interface DakshinVaarahiLogoProps {
  className?: string;
}

export const DakshinVaarahiLogo: React.FC<DakshinVaarahiLogoProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="cyber-vastu-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--brand-indigo))" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer Mandala Shape */}
      <path 
        d="M50 2 L61.22 15.35 L78.53 15.35 L84.65 30.31 L97.55 38.78 L94.19 55.81 L99.8 70.31 L89.44 82.65 L76.47 89.44 L64.69 99.8 L50 94.19 L35.31 99.8 L23.53 89.44 L10.56 82.65 L0.2 70.31 L5.81 55.81 L2.45 38.78 L15.35 30.31 L31.47 15.35 L48.78 15.35 Z"
        stroke="url(#cyber-vastu-gradient)"
        strokeWidth="1.5"
        strokeOpacity="0.7"
      />

      {/* Circuit Traces */}
      <g stroke="hsl(var(--primary))" strokeOpacity="0.6" strokeWidth="1">
        <path d="M50 2 V 15" />
        <path d="M50 98 V 85" />
        <path d="M2 50 H 15" />
        <path d="M98 50 H 85" />
        
        <path d="M21.5 21.5 L 35 35" />
        <path d="M78.5 78.5 L 65 65" />
        <path d="M21.5 78.5 L 35 65" />
        <path d="M78.5 21.5 L 65 35" />
      </g>
      
      {/* Inner Core */}
      <circle cx="50" cy="50" r="18" stroke="hsl(var(--primary))" strokeWidth="1" filter="url(#glow)" />
      <circle cx="50" cy="50" r="12" fill="url(#cyber-vastu-gradient)" />

      {/* Inner circuit detail */}
      <g stroke="hsl(var(--background))" strokeWidth="1.5" strokeLinecap="round">
        <path d="M50 38 V 45" />
        <path d="M50 62 V 55" />
        <path d="M38 50 H 45" />
        <path d="M62 50 H 55" />
      </g>
    </svg>
  );
};
