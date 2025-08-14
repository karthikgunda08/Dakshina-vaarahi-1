// src/components/dashboard/Sidebar.tsx
import React from 'react';
import { useAppStore } from '../../state/appStore';
import { DakshinVaarahiLogo } from '../icons/DakshinVaarahiLogo';
import { AppView } from '../../types/index';

const NavItem: React.FC<{
    view: AppView;
    title: string;
    icon: React.ReactNode;
    isOwnerOnly?: boolean;
    isPremium?: boolean;
}> = ({ view, title, icon, isOwnerOnly = false, isPremium = false }) => {
    const { view: currentView, setView, currentUser } = useAppStore();
    const isActive = currentView === view;

    if (isOwnerOnly && currentUser?.role !== 'owner') {
        return null;
    }

    return (
        <div className="relative group">
            <button
                onClick={() => setView(view)}
                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ease-in-out ${
                    isActive ? 'bg-primary text-primary-foreground scale-110' : 'bg-card/50 text-slate-300 hover:bg-card'
                } ${isPremium && !isActive ? 'premium-glow border border-primary/50' : ''}`}
                aria-label={title}
            >
                {icon}
            </button>
            <div role="tooltip" className="absolute left-full ml-4 px-3 py-1.5 bg-popover text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {title} {isPremium && '✨'}
            </div>
        </div>
    );
};

export const Sidebar: React.FC = () => {
    const { currentUser, setProfilePageOpen, setHelpModalOpen, logout } = useAppStore();

    if (!currentUser) return null;

    return (
        <aside className="w-20 bg-background/50 backdrop-blur-sm p-3 flex flex-col items-center justify-between border-r border-border">
            {/* Top Section: Logo and Main Nav */}
            <div className="flex flex-col items-center gap-4">
                <button onClick={() => useAppStore.setState({ view: 'userDashboard' })} className="w-12 h-12 mb-4 flex items-center justify-center transition-transform hover:rotate-6" aria-label="Go to Dashboard">
                    <DakshinVaarahiLogo className="w-auto h-12" />
                </button>
                <nav className="flex flex-col gap-3">
                    <NavItem view="userDashboard" title="Mission Control" icon={'🚀'} />
                    <NavItem view="brahmaAstra" title="Brahma-Astra" icon={'✨'} isPremium />
                    <NavItem view="atmanForge" title="Atman Forge" icon={'🔥'} />
                    <NavItem view="sutraEngine" title="Sutra Engine" icon={'📜'} />
                    <NavItem view="storyboard" title="Storyboard Engine" icon={'🎬'} />
                    <NavItem view="marketplace" title="Marketplace" icon={'🛒'} />
                    <NavItem view="realEstateExchange" title="Real Estate Exchange" icon={'💹'} />
                    <NavItem view="guilds" title="Guilds" icon={'🏛️'} />
                    <NavItem view="chronicles" title="Chronicles" icon={'📖'} />
                    <NavItem view="wallet" title="Wallet" icon={'💰'} />
                    <NavItem view="astraSupplyChain" title="Astra Network" icon={'🔗'} />
                    <NavItem view="developer" title="Developer Hub" icon={'</>'} />
                    <NavItem view="auraCommandCenter" title="Command Center" icon={'👑'} isOwnerOnly />
                </nav>
            </div>

            {/* Bottom Section: User, Settings, Logout */}
            <div className="flex flex-col items-center gap-3">
                 <button onClick={() => setHelpModalOpen(true)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors" aria-label="Help & Support">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.105.37-2.115 1-2.911m10.228-3.75a9 9 0 11-12.728 12.728A9 9 0 0118.457 5.25z" /></svg>
                </button>
                 <button onClick={logout} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors" aria-label="Logout">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
                <button onClick={() => setProfilePageOpen(true)} className="mt-2" aria-label="Profile & Settings">
                    <img
                        src={currentUser.profileImageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${currentUser.name || currentUser.email}`}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full border-2 border-slate-600 hover:border-primary transition-colors"
                    />
                </button>
            </div>
        </aside>
    );
};
