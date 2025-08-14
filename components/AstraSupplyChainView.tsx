// src/components/AstraSupplyChainView.tsx
import React, { useState, useEffect } from 'react';
import { Quote, Rfq, ProjectSummary, User } from '../types/index';
import * as astraService from '../services/astraService';
import { LoadingSpinner } from './common/LoadingSpinner';
import { useNotificationStore } from '../state/notificationStore';
import { useAppStore } from '../state/appStore';

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 font-medium rounded-t-lg border-b-2 transition-colors ${
            isActive ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
        }`}
    >
        {children}
    </button>
);


const MyQuotesTab: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        let isMounted = true;
        astraService.getUserQuotes()
            .then((data: Quote[]) => {
                if (isMounted) {
                    if (Array.isArray(data)) {
                        setQuotes(data as Quote[]);
                    } else {
                        setQuotes([]);
                        console.warn("Expected an array of quotes, but received:", data);
                        addNotification("Received an unexpected data format for quotes.", "error");
                    }
                }
            })
            .catch((err: Error) => {
                if (isMounted) {
                    addNotification(`Failed to load quotes: ${err.message}`, 'error');
                    setQuotes([]);
                }
            })
            .finally(() => { 
                if (isMounted) setIsLoading(false);
            });
        
        return () => { isMounted = false; };
    }, [addNotification]);
    
    const quotesByProject = quotes.reduce<Record<string, Quote[]>>((acc, quote) => {
        const projectName = (quote.projectId && typeof quote.projectId === 'object' && 'name' in quote.projectId) 
            ? quote.projectId.name 
            : 'Unknown Project';
        if (!acc[projectName]) acc[projectName] = [];
        acc[projectName].push(quote);
        return acc;
    }, {});

    if (isLoading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;

    return (
        Object.keys(quotesByProject).length > 0 ? (
            <div className="space-y-8">
                {Object.entries(quotesByProject).map(([projectName, projectQuotes]) => (
                    <div key={projectName}>
                        <h3 className="text-lg font-semibold text-slate-300 mb-3">{projectName}</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {Array.isArray(projectQuotes) && projectQuotes.map(quote => <QuoteCard key={quote._id} quote={quote} />)}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center p-8 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
                <p className="text-slate-400">You have no active quotes.</p>
                <p className="text-sm text-slate-500 mt-1">Generate a Bill of Quantities (BoQ) in the editor and request quotes to see them here.</p>
            </div>
        )
    );
};

const QuoteCard: React.FC<{ quote: Quote }> = ({ quote }) => {
    const statusStyles: Record<Quote['status'], string> = {
        pending: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
        accepted: 'bg-green-900/50 text-green-300 border-green-700',
        rejected: 'bg-red-900/50 text-red-300 border-red-700',
    };
    const supplierName = (quote.supplierId && typeof quote.supplierId === 'object' && 'name' in quote.supplierId) ? quote.supplierId.name : 'Unknown Supplier';
    return (
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-slate-100">{quote.materialName}</h4>
                    <p className="text-sm text-cyan-300">from {supplierName}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[quote.status]}`}>{quote.status}</span>
            </div>
            <div className="mt-3 flex justify-between items-end">
                <p className="text-sm text-slate-400">{quote.quantity} {quote.unit}</p>
                <p className="text-2xl font-bold text-green-400">₹{quote.price.toLocaleString('en-IN')}</p>
            </div>
        </div>
    );
};

const SupplierMarketplaceTab: React.FC = () => {
    const { globalRfqs, fetchGlobalRfqs } = useAppStore();
    useEffect(() => { fetchGlobalRfqs() }, [fetchGlobalRfqs]);
    return (
        Array.isArray(globalRfqs) && globalRfqs.length > 0 ? (
            <div className="space-y-4">
                {globalRfqs.map(rfq => (
                    <RfqCard key={rfq._id} rfq={rfq} />
                ))}
            </div>
        ) : (
            <div className="text-center p-8 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
                 <p className="text-slate-400">No global RFQs available in the network currently.</p>
            </div>
        )
    );
};

const RfqCard: React.FC<{ rfq: Rfq }> = ({ rfq }) => (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex justify-between items-center">
             <h4 className="font-bold text-slate-100">{rfq.projectId.name}</h4>
             <span className="text-xs text-slate-400">by {rfq.architectId.name}</span>
        </div>
        <div className="mt-3 border-t border-slate-700 pt-3">
             <p className="text-sm font-semibold text-slate-300 mb-2">Items Requested:</p>
             <ul className="text-xs space-y-1">
                {rfq.items.map((item, i) => (
                    <li key={i} className="flex justify-between">
                        <span>{item.item}</span>
                        <span className="font-mono">{item.quantity} {item.unit}</span>
                    </li>
                ))}
             </ul>
        </div>
        <button disabled className="w-full mt-4 text-sm p-2 rounded-md bg-slate-600 cursor-not-allowed">Submit Quote (Simulation)</button>
    </div>
);


const AstraSupplyChainView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'quotes' | 'marketplace'>('quotes');
    
    return (
        <div className="flex-grow p-8 bg-slate-900 text-white animated-gradient-bg-studio">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-cyan-300">Astra Network OS</h1>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto">Connect your designs to a real-time network of material suppliers. From automated RFQs to procurement management, Astra is the logistics backbone of your architectural empire.</p>
            </div>
            
            <div className="mt-12 max-w-4xl mx-auto">
                <div className="border-b border-slate-700 mb-6">
                    <nav className="flex space-x-4">
                        <TabButton isActive={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')}>My Quotes</TabButton>
                        <TabButton isActive={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')}>Supplier Marketplace</TabButton>
                    </nav>
                </div>
                {activeTab === 'quotes' && <MyQuotesTab />}
                {activeTab === 'marketplace' && <SupplierMarketplaceTab />}
            </div>
        </div>
    );
};

export default AstraSupplyChainView;