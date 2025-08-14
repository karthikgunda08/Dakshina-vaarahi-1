// src/features/tools/LokaSimulatorTool.tsx
// src/features/tools/VayuAstraTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, LokaSimulatorReport } from '../../types/index';
import { runLokaSimulatorApi } from '../../services/geminiService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const ReportCard: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-slate-900/50 p-3 rounded-md border border-slate-700">
        <h5 className="font-semibold text-sky-300 mb-1">{title}</h5>
        <div className="text-sm text-slate-200 space-y-1">{children}</div>
    </div>
);

export const VayuAstraTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { currentUser, setBuyCreditsModalOpen, refreshCurrentUser, currentProject, lokaSimulatorReport, setLokaSimulatorReport } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addNotification } = useNotificationStore();

    const handleAnalyze = async () => {
        const location = currentProject?.location;
        if (!location) {
            addNotification("Please set a project location first in the Project Hub.", "error");
            return;
        }
        if (!currentUser) {
            addNotification("Please log in.", "error");
            return;
        }
        if (currentUser.role !== 'owner' && currentUser.credits < 10) {
            addNotification(`You need 10 credits for the Loka Simulator.`, 'info');
            setBuyCreditsModalOpen(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            if (!currentProject?.id) {
                throw new Error("No active project to associate the cost with.");
            }
            const response = await runLokaSimulatorApi(currentProject.id, location);
            setLokaSimulatorReport(response);
            addNotification("World simulation complete!", "success");
            await refreshCurrentUser();
        } catch (err: any) {
            setError(err.message);
            addNotification(`Simulation failed: ${err.message}`, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300">Vayu-Astra (Climate Simulator)</h3>
            <p className="text-sm text-slate-300 my-3">Simulate real-world environmental data for your project's location. This helps in making informed decisions for sustainable design, like optimizing for wind patterns (Vayu).</p>
            
            <div className="p-3 bg-slate-700/50 rounded-lg mb-4">
                <p className="text-xs text-slate-400">Project Location</p>
                <p className="font-semibold text-amber-300">{currentProject?.location || 'Not Set'}</p>
            </div>

            <button
                onClick={handleAnalyze}
                disabled={isLoading || !currentProject?.location}
                className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
                {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">🌍</span>}
                <span className="flex-grow">{isLoading ? 'Simulating World...' : 'Run World Simulation'}</span>
                <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">10 credits</span>
            </button>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

            {lokaSimulatorReport && (
                <div className="mt-4 space-y-3">
                    <ReportCard title="Climate Summary">
                        <p className="italic">{lokaSimulatorReport.summary}</p>
                    </ReportCard>
                    <div className="grid grid-cols-2 gap-3">
                        <ReportCard title="Solar Irradiance">
                            <p><strong>Annual Avg:</strong> {lokaSimulatorReport.solarIrradiance.annual} {lokaSimulatorReport.solarIrradiance.units}</p>
                            <p><strong>Peak:</strong> {lokaSimulatorReport.solarIrradiance.peakMonths.join(', ')}</p>
                        </ReportCard>
                         <ReportCard title="Wind Patterns">
                            <p><strong>Dominant:</strong> {lokaSimulatorReport.windPatterns.dominantDirection}</p>
                            <p><strong>Avg Speed:</strong> {lokaSimulatorReport.windPatterns.averageSpeed} {lokaSimulatorReport.windPatterns.units}</p>
                        </ReportCard>
                         <ReportCard title="Temperature">
                             <p><strong>Min/Max:</strong> {lokaSimulatorReport.temperatureRange.annualMin}° - {lokaSimulatorReport.temperatureRange.annualMax}° C</p>
                        </ReportCard>
                         <ReportCard title="Precipitation">
                            <p><strong>Annual Avg:</strong> {lokaSimulatorReport.precipitation.annualAverage} {lokaSimulatorReport.precipitation.units}</p>
                            <p><strong>Wettest:</strong> {lokaSimulatorReport.precipitation.wettestMonths.join(', ')}</p>
                        </ReportCard>
                    </div>
                </div>
            )}
        </div>
    );
};