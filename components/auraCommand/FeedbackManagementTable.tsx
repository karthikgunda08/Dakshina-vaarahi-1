// src/components/auraCommand/FeedbackManagementTable.tsx
import React from 'react';
import { Feedback } from '../../types/index';
import { exportToCsv } from '../../utils/exportUtils';

const categoryLabels: Record<string, string> = {
    'bug_report': 'Bug Report',
    'feature_request': 'Feature Request',
    'general_feedback': 'General Feedback'
};
const categoryColors: Record<string, string> = {
    'bug_report': 'bg-red-500 text-white',
    'feature_request': 'bg-sky-500 text-white',
    'general_feedback': 'bg-slate-500 text-white'
};


export const FeedbackManagementTable: React.FC<{ feedback: Feedback[] }> = ({ feedback }) => {
    
    const handleExport = () => {
        if (feedback.length === 0) {
            alert("No feedback to export.");
            return;
        }
        const dataToExport = feedback.map(item => ({
            Category: categoryLabels[item.category] || 'Unknown',
            Message: item.message,
            User: item.userId?.email || 'N/A',
            Date: new Date(item.createdAt).toLocaleString(),
            Status: item.status,
        }));
        exportToCsv(dataToExport, 'feedback_export.csv');
    };

    return (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-slate-100">User Feedback ({feedback.length})</h2>
                <button onClick={handleExport} className="px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-md flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export as CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-700/50 text-xs text-slate-400 uppercase">
                        <tr>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Message</th>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedback.length > 0 ? (
                            feedback.map(item => (
                                <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${categoryColors[item.category]}`}>
                                            {categoryLabels[item.category] || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium whitespace-pre-wrap max-w-md">{item.message}</td>
                                    <td className="px-4 py-3">{item.userId?.email || 'N/A'}</td>
                                    <td className="px-4 py-3">{new Date(item.createdAt!).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center p-4 text-slate-400">
                                    No feedback has been submitted yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};