
// src/components/auraCommand/UserManagementTable.tsx
import React, { useState, useMemo } from 'react';
import { User } from '../../types/index';
import { exportToCsv } from '../../utils/exportUtils';

type SortKey = 'email' | 'name' | 'role' | 'credits' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface UserManagementTableProps {
    users: User[];
}

const SortableHeader: React.FC<{
    sortKey: SortKey;
    title: string;
    currentSortKey: SortKey;
    currentSortOrder: SortOrder;
    onSort: (key: SortKey) => void;
    className?: string;
}> = ({ sortKey, title, currentSortKey, currentSortOrder, onSort, className }) => (
    <th className={`px-4 py-3 cursor-pointer select-none transition-colors hover:bg-slate-600/50 ${className}`} onClick={() => onSort(sortKey)}>
        <div className="flex items-center">
            <span>{title}</span>
            {currentSortKey === sortKey && (
                <span className="ml-2">{currentSortOrder === 'asc' ? '▲' : '▼'}</span>
            )}
        </div>
    </th>
);

export const UserManagementTable: React.FC<UserManagementTableProps> = ({ users }) => {
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder(key === 'name' || key === 'email' || key === 'role' ? 'asc' : 'desc');
        }
    };

    const filteredAndSortedUsers = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = users.filter(user =>
            user.email.toLowerCase().includes(lowercasedFilter) ||
            (user.name && user.name.toLowerCase().includes(lowercasedFilter))
        );

        return [...filtered].sort((a, b) => {
            const valA = a[sortKey as keyof User] ?? '';
            const valB = b[sortKey as keyof User] ?? '';

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [users, sortKey, sortOrder, searchTerm]);

    const handleExport = () => {
        const dataToExport = filteredAndSortedUsers.map(user => ({
            Email: user.email,
            Name: user.name || 'N/A',
            Role: user.role,
            Credits: user.role === 'owner' ? 'Unlimited' : user.credits,
            'Joined On': new Date(user.createdAt!).toLocaleDateString(),
        }));
        exportToCsv(dataToExport, 'users_export.csv');
    };

    return (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-slate-100">User Management ({filteredAndSortedUsers.length})</h2>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400"
                    />
                     <button onClick={handleExport} className="px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-md flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export as CSV
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-700/50 text-xs text-slate-400 uppercase">
                        <tr>
                            <SortableHeader sortKey="email" title="Email" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader sortKey="name" title="Name" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader sortKey="role" title="Role" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="text-center" />
                            <SortableHeader sortKey="credits" title="Credits" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="text-right" />
                            <SortableHeader sortKey="createdAt" title="Joined On" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} />
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedUsers.length > 0 ? (
                            filteredAndSortedUsers.map(user => (
                                <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                                    <td className="px-4 py-3 font-medium">{user.email}</td>
                                    <td className="px-4 py-3">{user.name || 'N/A'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                            user.role === 'owner' ? 'bg-amber-500 text-slate-900' : 'bg-sky-500 text-white'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">{user.role === 'owner' ? '∞' : user.credits}</td>
                                    <td className="px-4 py-3">{new Date(user.createdAt!).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center p-4 text-slate-400">
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};