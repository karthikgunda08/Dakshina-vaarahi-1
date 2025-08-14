// src/components/developer/DeveloperHubView.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../state/appStore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import * as authService from '../../services/authService';
import { useNotificationStore } from '../../state/notificationStore';

const mockApiUsage = [
    { date: '7 days ago', calls: 120 },
    { date: '6 days ago', calls: 250 },
    { date: '5 days ago', calls: 180 },
    { date: '4 days ago', calls: 320 },
    { date: '3 days ago', calls: 280 },
    { date: '2 days ago', calls: 450 },
    { date: 'yesterday', calls: 400 },
];

const DeveloperHubView: React.FC = () => {
    const { currentUser, refreshCurrentUser } = useAppStore();
    const { addNotification } = useNotificationStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [apiKey, setApiKey] = useState(currentUser?.apiKey || '********************************');

    useEffect(() => {
        if (currentUser?.apiKey) {
            setApiKey(currentUser.apiKey);
        }
    }, [currentUser?.apiKey]);

    const handleGenerateKey = async () => {
        if (!window.confirm("Regenerating your API key will invalidate the old one. Are you sure you want to proceed?")) {
            return;
        }
        setIsGenerating(true);
        try {
            const result = await authService.generateApiKey();
            setApiKey(result.apiKey);
            await refreshCurrentUser(); // Refresh user state to get the new key stored
            addNotification("API Key regenerated successfully!", "success");
        } catch (error: any) {
            addNotification(`Failed to generate key: ${error.message}`, 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex-grow p-8 animated-gradient-bg-studio overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-white">Developer Hub</h1>
                    <p className="text-lg text-slate-400 mt-2">Integrate the power of AuraOS into your own applications and workflows with our Public API.</p>
                </header>
                
                <div className="space-y-10">
                    {/* API Key Management */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-2xl font-semibold text-sky-300 mb-4">API Key Management</h2>
                        <div className="bg-slate-900/50 p-4 rounded-lg flex items-center justify-between">
                            <code className="text-slate-300 font-mono">{apiKey}</code>
                            <Button variant="secondary" size="sm" onClick={() => {
                                navigator.clipboard.writeText(apiKey);
                                addNotification("API Key copied to clipboard", "success");
                            }}>Copy</Button>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-slate-400">This key provides access to generative and analysis endpoints.</p>
                            <Button onClick={handleGenerateKey} disabled={isGenerating}>
                                {isGenerating && <LoadingSpinner size="h-4 w-4 mr-2" />}
                                {isGenerating ? 'Generating...' : 'Regenerate Key'}
                            </Button>
                        </div>
                    </div>

                    {/* API Usage */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-2xl font-semibold text-sky-300 mb-4">API Usage (Last 7 Days)</h2>
                        <div className="w-full h-72">
                             <ResponsiveContainer>
                                <AreaChart data={mockApiUsage} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', borderColor: 'hsl(var(--border))' }} />
                                    <Area type="monotone" dataKey="calls" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUv)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                     {/* API Docs */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
                        <h2 className="text-2xl font-semibold text-sky-300 mb-2">Ready to Build?</h2>
                        <p className="text-slate-400 mb-4">Dive into our comprehensive documentation to start building.</p>
                        <Button size="lg" disabled title="Comprehensive API documentation will be released in a future update.">View API Documentation (Coming Soon)</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeveloperHubView;