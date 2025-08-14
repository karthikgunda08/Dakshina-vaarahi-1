// src/components/common/Footer.tsx
import React from 'react';
import { DakshinVaarahiLogo } from '../icons/DakshinVaarahiLogo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  return (
    <footer id="footer" className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4 text-center">
         <DakshinVaarahiLogo className="h-16 w-auto mx-auto mb-4" />
        <p className="mt-2 mb-6 text-lg text-slate-300 font-heading">
          The AI Operating System for Architecture.
        </p>
        <div className="text-xs text-muted-foreground">
            <p>&copy; {currentYear} Dakshin Vaarahi. All Rights Reserved.</p>
            <div className="flex justify-center gap-4 mt-2">
                 <button onClick={() => navigateTo('/terms')} className="hover:text-primary transition-colors">Terms of Service</button>
                 <span>|</span>
                 <button onClick={() => navigateTo('/privacy')} className="hover:text-primary transition-colors">Privacy Policy</button>
                 <span>|</span>
                 <a href="mailto:support@dakshinvaarahi.com" className="hover:text-primary transition-colors">Support</a>
            </div>
        </div>
      </div>
    </footer>
  );
};