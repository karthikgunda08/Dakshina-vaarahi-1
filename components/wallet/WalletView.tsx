// src/components/wallet/WalletView.tsx
import React, { useState, useEffect, Suspense } from 'react';
import { useAppStore } from '../../state/appStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import * as walletService from '../../services/walletService';
import { Transaction } from '../../types/index';
const TransactionList = React.lazy(() => import('./TransactionList'));

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 font-medium rounded-t-lg border-b-2 transition-colors ${
            isActive ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-white'
        }`}
    >
        {children}
    </button>
);

const WalletView: React.FC = () => {
    const { currentUser, setBuyCreditsModalOpen } = useAppStore(state => ({
        currentUser: state.currentUser,
        setBuyCreditsModalOpen: state.setBuyCreditsModalOpen,
    }));

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'earnings'>('overview');

    useEffect(() => {
        walletService.getTransactions()
            .then(data => setTransactions(data.transactions))
            .catch(err => setError(err.message || "Could not load transactions."))
            .finally(() => setIsLoading(false));
    }, []);

    if (!currentUser) return null;

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
        }
        if (error) {
            return <div className="p-8 text-center text-red-400">{error}</div>;
        }

        switch(activeTab) {
            case 'transactions':
                return <Suspense fallback={<LoadingSpinner />}><TransactionList transactions={transactions} /></Suspense>;
            case 'earnings':
                 return (
                    <div className="p-8 text-center bg-slate-800/50 rounded-lg">
                        <h3 className="text-xl font-semibold text-white">Marketplace Earnings</h3>
                        <p className="text-5xl font-extrabold text-emerald-400 my-4">{currentUser.marketplaceEarnings || 0} <span className="text-xl text-slate-300">credits</span></p>
                        <p className="text-slate-400 mb-6">This is the total number of credits you've earned from template sales. Payout options will be available soon.</p>
                        <button disabled className="px-6 py-3 bg-slate-600 rounded-md cursor-not-allowed">Request Payout (Coming Soon)</button>
                    </div>
                );
            case 'overview':
            default:
                return (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 text-center bg-slate-800/50 rounded-lg">
                            <h3 className="text-xl font-semibold text-white">Current Credit Balance</h3>
                            <p className="text-6xl font-extrabold text-amber-400 my-4">{currentUser.credits}</p>
                            <button onClick={() => setBuyCreditsModalOpen(true)} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-md shadow-lg">
                                Buy More Credits
                            </button>
                        </div>
                        <div className="p-8 text-center bg-slate-800/50 rounded-lg">
                            <h3 className="text-xl font-semibold text-white">Total Marketplace Earnings</h3>
                            <p className="text-6xl font-extrabold text-emerald-400 my-4">{currentUser.marketplaceEarnings || 0}</p>
                            <button onClick={() => setActiveTab('earnings')} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-md shadow-lg">
                                View Earnings
                            </button>
                        </div>
                    </div>
                )
        }
    };

    return (
        <div className="flex-grow animated-gradient-bg-studio py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white">Wallet & Billing</h1>
                    <p className="mt-2 text-lg text-slate-300">Manage your credits and view your transaction history.</p>
                </div>
                
                <div className="bg-slate-800/30 border border-slate-700 rounded-xl max-w-4xl mx-auto">
                    <div className="border-b border-slate-700 px-4">
                         <nav className="flex space-x-4">
                            <TabButton isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                            <TabButton isActive={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')}>History</TabButton>
                            <TabButton isActive={activeTab === 'earnings'} onClick={() => setActiveTab('earnings')}>Earnings</TabButton>
                        </nav>
                    </div>
                    <div className="p-4 md:p-8">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletView;
