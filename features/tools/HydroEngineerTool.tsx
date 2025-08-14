// src/features/tools/HydroEngineerTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, VarunaReport } from '../../types/index';
import { runVarunaEngineApi } from '../../services/geminiService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const ReportSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="mt-3">
        <h4 className="font-bold text-sky-300 mb-1">{title}</h4>
        <div className="space-y-2 text-xs text-slate-300 pl-2 border-l-2 border-slate-700">{children}</div>
    </div>
);

const PlanVisualizer: React.FC<{ report: VarunaReport }> = ({ report }) => {
    const viewBoxSize = 2000;
    return (
        <div className="w-full aspect-square bg-slate-800 rounded-md mt-2 p-2">
            <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
                <rect width="100%" height="100%" fill="#1e293b" />
                {/* Draw Canals */}
                {report.canals.map((canal, i) => (
                    <polyline
                        key={`canal-${i}`}
                        points={canal.path.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke={canal.type === 'Main Canal' ? '#38bdf8' : '#67e8f9'}
                        strokeWidth={canal.type === 'Main Canal' ? '15' : '8'}
                        strokeLinecap="round"
                    />
                ))}
                {/* Draw Reservoirs */}
                {report.reservoirs.map((res, i) => (
                     <circle key={`res-${i}`} cx={res.location.x} cy={res.location.y} r="30" fill="#3b82f6" opacity="0.7" />
                ))}
                {/* Draw Dams */}
                {report.dams.map((dam, i) => (
                    <rect key={`dam-${i}`} x={dam.location.x - 20} y={dam.location.y - 5} width="40" height="10" fill="#94a3b8" />
                ))}
            </svg>
        </div>
    );
};


export const HydroEngineerTool: React.FC<PhoenixEnginePanelProps> = (props) => {
  const { currentUser, setBuyCreditsModalOpen, refreshCurrentUser, currentProject } = props;
  const [prompt, setPrompt] = useState('Design a canal network to connect the Godavari and Krishna rivers to irrigate the drought-prone regions of Rayalaseema in Andhra Pradesh. Include conceptual placements for reservoirs.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<VarunaReport | null>(null);
  const { addNotification } = useNotificationStore();

  const handleGenerate = async () => {
    if (!prompt.trim() || !currentUser) return;
    if (currentUser.role !== 'owner' && currentUser.credits < 300) {
      addNotification(`The Varuna Engine requires 300 credits.`, 'info');
      setBuyCreditsModalOpen(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setReport(null);
    
    try {
      const response = await runVarunaEngineApi(currentProject?.id || '', prompt);
      setReport(response);
      addNotification("The Varuna Engine has generated a hydro-engineering proposal!", "success");
      await refreshCurrentUser();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      addNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-sky-300">Varuna Hydro-Engineering Engine</h3>
      <p className="text-sm text-slate-300 my-3">Operate at a national scale. Describe a large-scale water resource management mission, and the Varuna Engine will generate a conceptual plan for canal networks, dams, and reservoirs.</p>
      
      <textarea 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)} 
        rows={4} 
        className="w-full p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-sky-500" 
        placeholder="e.g., Plan an inter-state river linking project..." 
        disabled={isLoading} 
      />
      <button 
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim()}
        className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-blue-600 to-teal-700 hover:from-blue-700 hover:to-teal-800"
      >
        {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">🌊</span>}
        <span className="flex-grow">{isLoading ? 'Generating Plan...' : 'Generate Hydro Plan'}</span>
        <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">300 credits</span>
      </button>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      
      {report && (
        <div className="mt-4 bg-slate-700/50 rounded-lg p-3">
            <h3 className="font-bold text-lg text-amber-300">Varuna Engine Report</h3>
            <ReportSection title="Narrative"><p>{report.narrative}</p></ReportSection>
            <ReportSection title="Inferred Topography"><p>{report.topographySummary}</p></ReportSection>
            <ReportSection title="Plan Visualizer">
                <PlanVisualizer report={report} />
            </ReportSection>
            <ReportSection title="Environmental Impact Assessment"><p>{report.environmentalImpact}</p></ReportSection>
        </div>
      )}
    </div>
  );
}