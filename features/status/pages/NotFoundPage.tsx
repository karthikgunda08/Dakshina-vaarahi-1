// src/features/status/pages/NotFoundPage.tsx
import React from 'react';
import { Header } from '../../../components/common/Header';
import { Footer } from '../../../components/common/Footer';
import { Button } from '../../../components/ui/Button';

const NotFoundPage: React.FC = () => {
  const navigateHome = () => {
    window.location.hash = '/';
  };

  return (
    <div className="flex flex-col min-h-screen animated-gradient-bg-studio">
      <Header />
      <main className="flex-grow flex items-center justify-center text-center">
        <div className="p-8">
          <h1 className="text-6xl font-extrabold text-primary tracking-tighter">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-white">Page Not Found</h2>
          <p className="mt-2 text-slate-400">Sorry, we couldn't find the page you're looking for.</p>
          <Button onClick={navigateHome} className="mt-8">
            Return to Home
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFoundPage;