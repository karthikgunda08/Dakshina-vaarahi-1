// src/components/common/Header.tsx
import React from 'react';
import { useAppStore } from '../../state/appStore';
import { Button } from '../ui/Button';
import { DakshinVaarahiLogo } from '../icons/DakshinVaarahiLogo';

export const Header: React.FC = () => {
    const { currentUser, setAuthModal, setView } = useAppStore(state => ({
        currentUser: state.currentUser,
        setAuthModal: state.setAuthModal,
        setView: state.setView,
    }));

    const navigateTo = (path: string) => {
      // Using hash-based routing to align with App.tsx logic
      window.location.hash = path;
    };

    return (
        <header className="relative z-50 bg-background/50 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                <button onClick={() => navigateTo('/')} className="flex items-center gap-3 group">
                    <DakshinVaarahiLogo className="h-10 w-auto transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-xl font-bold text-white tracking-wider group-hover:text-primary transition-colors">Dakshin Vaarahi</span>
                </button>

                <nav className="hidden md:flex items-center gap-x-2">
                     <Button onClick={() => navigateTo('/showcase')} variant="ghost" className="text-white hover:bg-white/10">Showcase</Button>
                     <Button onClick={() => navigateTo('/foundation')} variant="ghost" className="text-white hover:bg-white/10">Foundation</Button>
                </nav>

                <div className="flex items-center gap-x-2">
                    {currentUser ? (
                         <Button onClick={() => setView('userDashboard')} variant="secondary">Launch Studio</Button>
                    ) : (
                        <>
                            <Button onClick={() => setAuthModal('login')} variant="ghost" className="text-white hover:bg-white/10">Login</Button>
                            <Button onClick={() => setAuthModal('register')}>Sign Up</Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};