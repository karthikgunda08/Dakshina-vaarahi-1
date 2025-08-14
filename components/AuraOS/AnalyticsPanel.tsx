// src/components/AuraOS/AnalyticsPanel.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../state/appStore';
import { ProjectAnalyticsData } from '../../types/index';
import * as projectService from '../../services/projectService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-slate-800/80 border border-slate-600 rounded-md text-xs">
                <p className="label text-slate-200">{`${label} : ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const AnalyticsPanel: React.FC = () => {
    const { currentProject } = useAppStore();
    const [analyticsData, setAnalyticsData] = useState<ProjectAnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        if (currentProject) {
            setIsLoading(true);
            projectService.getProjectAnalytics(currentProject.id)
                .then(data => {
                    if (isMounted) setAnalyticsData(data);
                })
                .catch(err => console.error("Failed to load project analytics:", err))
                .finally(() => {
                    if (isMounted) setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
        return () => { isMounted = false; };
    }, [currentProject]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    }

    if (!analyticsData) {
        return <div className="p-4 text-center text-slate-400">No analytics data available. Run AI analysis tools to generate data.</div>;
    }
    
    return (
        <div className="p-4 space-y-6 overflow-y-auto h-full">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                    <p className="text-sm text-slate-300">Vastu Score</p>
                    <p className="text-4xl font-bold text-purple-300">{analyticsData.vastuScore}<span className="text-lg text-slate-400">/100</span></p>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                    <p className="text-sm text-slate-300">Sustainability Score</p>
                    <p className="text-4xl font-bold text-emerald-300">{analyticsData.sustainabilityScore}<span className="text-lg text-slate-400">/100</span></p>
                </div>
            </div>

            {analyticsData.creditUsage.length > 0 && (
                <div>
                    <h4 className="font-semibold text-sky-300 mb-2">AI Credit Usage by Tool</h4>
                    <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer>
                            <BarChart data={analyticsData.creditUsage} layout="vertical" margin={{ left: 100 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 10, width: 100 }} width={100} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.1)'}} contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: 'rgba(255, 255, 255, 0.2)'}} />
                                <Bar dataKey="cost" fill="#8884d8" name="Credits" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {analyticsData.materialDistribution.length > 0 && (
                <div>
                    <h4 className="font-semibold text-sky-300 mb-2">Material Distribution (by Quantity)</h4>
                     <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={analyticsData.materialDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8">
                                    {analyticsData.materialDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: 'rgba(255, 255, 255, 0.2)'}}/>
                                <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPanel;