// src/components/brahmaAstra/BrahmaAstraEngineView.tsx
import React, { useState } from 'react';
import { useAppStore } from '../../state/appStore';
import { BrahmaAstraMission } from '../../types/index';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { CreditCostDisplay } from '../common/CreditCostDisplay';

const TextInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string; placeholder: string; }> = ({ label, value, onChange, name, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-amber-200 mb-1">{label}</label>
        <input type="text" name={name} id={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-md text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-400" />
    </div>
);
const TextAreaInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; name: string; rows: number; placeholder: string; }> = ({ label, value, onChange, name, rows, placeholder }) => (
     <div>
        <label htmlFor={name} className="block text-sm font-semibold text-amber-200 mb-1">{label}</label>
        <textarea name={name} id={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-md text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-400" />
    </div>
);

const ReportSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-bold text-sky-300 mb-4">{title}</h3>
        <div className="prose prose-sm prose-invert max-w-none">{children}</div>
    </div>
);

const BrahmaAstraEngineView: React.FC = () => {
    const { runBrahmaAstra, isBrahmaAstraRunning, brahmaAstraReport, setView } = useAppStore(state => ({
        runBrahmaAstra: state.runBrahmaAstra,
        isBrahmaAstraRunning: state.isBrahmaAstraRunning,
        brahmaAstraReport: state.brahmaAstraReport,
        setView: state.setView,
    }));

    const [mission, setMission] = useState<BrahmaAstraMission>({
        goal: 'A profitable, sustainable, and Vastu-compliant 5-acre mixed-use community.',
        location: 'Hyderabad, India',
        targetDemographic: 'Young professional families',
        budget: 'Moderate',
        constraints: 'Maximize green space and pedestrian-friendly paths.',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setMission(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleExecute = () => {
        runBrahmaAstra(mission);
    };

    if (isBrahmaAstraRunning) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-900 text-slate-200 h-full">
                <LoadingSpinner color="text-amber-400" size="h-16 w-16" />
                <h1 className="text-3xl font-bold text-amber-300 mt-6">Executing Mission...</h1>
                <p className="text-slate-300 max-w-lg mt-2">The Brahma-Astra Engine is orchestrating a full development proposal. This may take several minutes as it performs market analysis, master planning, architectural design, and financial projections.</p>
            </div>
        );
    }
    
    if (brahmaAstraReport) {
        return (
             <div className="flex-grow p-4 md:p-8 overflow-y-auto bg-slate-900">
                 <div className="max-w-5xl mx-auto space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-amber-300">Brahma-Astra Report</h1>
                        <p className="text-lg text-slate-300">Mission: {brahmaAstraReport.mission.goal}</p>
                         <button onClick={() => setView('userDashboard')} className="mt-4 px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md">Back to Dashboard</button>
                    </div>

                    <ReportSection title="Overall Narrative">
                        <p>{brahmaAstraReport.overallNarrative}</p>
                    </ReportSection>
                    
                     <ReportSection title="Market Analysis">
                        <p>{brahmaAstraReport.marketAnalysis.summary}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            {brahmaAstraReport.marketAnalysis.keyDataPoints.map(dp => (
                                <div key={dp.label} className="bg-slate-700/50 p-3 rounded-md">
                                    <div className="text-xs text-slate-400">{dp.label}</div>
                                    <div className="text-base font-semibold text-slate-100">{dp.value}</div>
                                </div>
                            ))}
                        </div>
                    </ReportSection>
                    
                    <ReportSection title="Financial Projections">
                         <p>{brahmaAstraReport.financialProjections.summary}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="bg-slate-700/50 p-3 rounded-md"><div className="text-xs text-slate-400">Est. Cost</div><div className="text-lg font-bold text-red-300">{brahmaAstraReport.financialProjections.estimatedCost}</div></div>
                             <div className="bg-slate-700/50 p-3 rounded-md"><div className="text-xs text-slate-400">Projected Revenue</div><div className="text-lg font-bold text-green-300">{brahmaAstraReport.financialProjections.projectedRevenue}</div></div>
                             <div className="bg-slate-700/50 p-3 rounded-md"><div className="text-xs text-slate-400">Est. ROI</div><div className="text-lg font-bold text-sky-300">{brahmaAstraReport.financialProjections.roi}</div></div>
                        </div>
                    </ReportSection>
                    
                     <ReportSection title="Master Plan">
                        <p>{brahmaAstraReport.masterPlan.narrative}</p>
                         {/* TODO: Add a visualizer for zones and infrastructure */}
                    </ReportSection>

                 </div>
             </div>
        )
    }

    return (
        <div className="flex-grow flex items-center justify-center animated-gradient-bg">
            <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-md p-8 rounded-xl border border-slate-700 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-amber-300">Brahma-Astra Engine</h1>
                    <p className="text-slate-300 mt-2">Define your mission. The AI will handle the rest.</p>
                </div>
                <div className="space-y-4">
                    <TextAreaInput label="Primary Goal" name="goal" value={mission.goal} onChange={handleChange} rows={2} placeholder="e.g., A profitable, sustainable mixed-use community..." />
                    <div className="grid md:grid-cols-2 gap-4">
                        <TextInput label="Location" name="location" value={mission.location} onChange={handleChange} placeholder="e.g., Hyderabad, India" />
                        <TextInput label="Target Demographic" name="targetDemographic" value={mission.targetDemographic} onChange={handleChange} placeholder="e.g., Young professional families" />
                    </div>
                    <TextInput label="Budget" name="budget" value={mission.budget} onChange={handleChange} placeholder="e.g., Moderate, High-end, etc." />
                    <TextAreaInput label="Key Constraints or Features" name="constraints" value={mission.constraints} onChange={handleChange} rows={2} placeholder="e.g., Maximize green space, must be Vastu-compliant" />
                </div>
                <div className="mt-8 flex justify-between items-center">
                     <button onClick={() => setView('userDashboard')} className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md">Back to Dashboard</button>
                    <button
                        onClick={handleExecute}
                        className="px-4 py-3 font-semibold text-white rounded-md bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 shadow-lg flex items-center gap-2"
                    >
                        <span className="text-lg">✨</span>
                        <span className="flex-grow">Execute Mission</span>
                        <CreditCostDisplay cost={250} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BrahmaAstraEngineView;