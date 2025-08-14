
// src/components/auraCommand/ProjectManagementTable.tsx
import React, { useState, useMemo } from 'react';
import { ProjectSummary } from '../../types/index';
import { exportToCsv } from '../../utils/exportUtils';

type SortKey = 'name' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

interface ProjectManagementTableProps {
    projects: ProjectSummary[];
}

const SortableHeader: React.FC<{
    sortKey: SortKey;
    title: string;
    currentSortKey: SortKey;
    currentSortOrder: SortOrder;
    onSort: (key: SortKey) => void;
}> = ({ sortKey, title, currentSortKey, currentSortOrder, onSort }) => (
    <th className="px-4 py-3 cursor-pointer select-none transition-colors hover:bg-slate-600/50" onClick={() => onSort(sortKey)}>
        <div className="flex items-center">
            <span>{title}</span>
            {currentSortKey === sortKey && (
                <span className="ml-2">{currentSortOrder === 'asc' ? '▲' : '▼'}</span>
            )}
        </div>
    </th>
);

export const ProjectManagementTable: React.FC<ProjectManagementTableProps> = ({ projects }) => {
    const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder(key === 'name' ? 'asc' : 'desc');
        }
    };

    const filteredAndSortedProjects = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = projects.filter(project => 
            project.name.toLowerCase().includes(lowercasedFilter) ||
            (project.userId?.email && project.userId.email.toLowerCase().includes(lowercasedFilter))
        );
        
        return [...filtered].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [projects, sortKey, sortOrder, searchTerm]);

    const handleExport = () => {
        const dataToExport = filteredAndSortedProjects.map(project => ({
            'Project Name': project.name,
            'Owner': project.userId?.email || 'N/A',
            'Type': project.projectType,
            'Last Updated': new Date(project.updatedAt).toLocaleString(),
            'Folio Link': (project.folio?.isEnabled && project.folio.shareableLink) 
                ? `${window.location.origin}/folio/${project.folio.shareableLink}` 
                : 'N/A'
        }));
        exportToCsv(dataToExport, 'projects_export.csv');
    };

    return (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-slate-100">Project Management ({filteredAndSortedProjects.length})</h2>
                 <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search projects..."
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
                            <SortableHeader sortKey="name" title="Project Name" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} />
                            <th className="px-4 py-3">Owner</th>
                            <th className="px-4 py-3">Type</th>
                            <SortableHeader sortKey="updatedAt" title="Last Updated" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} />
                            <th className="px-4 py-3 text-center">Folio Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedProjects.length > 0 ? (
                            filteredAndSortedProjects.map(project => (
                                <tr key={project.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                                    <td className="px-4 py-3 font-medium">{project.name}</td>
                                    <td className="px-4 py-3">{project.userId?.email || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                            project.projectType === 'masterPlan' ? 'bg-purple-500 text-white' : 'bg-sky-500 text-white'
                                        }`}>
                                            {project.projectType === 'masterPlan' ? 'Master Plan' : 'Building'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{new Date(project.updatedAt).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center">
                                        {project.folio?.isEnabled && project.folio.shareableLink ? (
                                            <a 
                                                href={`/folio/${project.folio.shareableLink}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sky-400 hover:underline"
                                            >
                                                View
                                            </a>
                                        ) : (
                                            <span className="text-slate-500">None</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center p-4 text-slate-400">
                                    No projects found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};