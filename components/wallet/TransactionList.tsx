// src/components/wallet/TransactionList.tsx
import React from 'react';
import { Transaction } from '../../types/index';

const iconMap: Record<Transaction['type'], React.ReactNode> = {
    credit_purchase: <span title="Credit Purchase">🛍️</span>,
    ai_tool_usage: <span title="AI Tool Usage">🤖</span>,
    marketplace_sale: <span title="Marketplace Sale">📈</span>,
    marketplace_purchase: <span title="Marketplace Purchase">🛒</span>,
    payout: <span title="Payout">💸</span>,
    adjustment: <span title="Adjustment">⚙️</span>,
};

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const isCredit = transaction.amount > 0;
    return (
        <li className="flex items-center justify-between p-3 bg-slate-900/50 rounded-md">
            <div className="flex items-center gap-3">
                <div className="text-2xl">{iconMap[transaction.type] || '⚙️'}</div>
                <div>
                    <p className="font-medium text-slate-200">{transaction.description}</p>
                    <p className="text-xs text-slate-400">{new Date(transaction.createdAt).toLocaleString()}</p>
                </div>
            </div>
            <div className={`font-semibold text-lg ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                {isCredit ? '+' : ''}{transaction.amount}
            </div>
        </li>
    );
};

const TransactionList: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    if (transactions.length === 0) {
        return <p className="text-center text-slate-400 p-8">No transactions yet.</p>;
    }
    return (
        <ul className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
            {transactions.map(tx => <TransactionRow key={tx._id} transaction={tx} />)}
        </ul>
    );
};

export default TransactionList;
