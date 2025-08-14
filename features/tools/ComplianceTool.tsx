// src/features/tools/ComplianceTool.tsx
import React, { useState } from 'react';
import { GenericApiTool } from './misc/GenericApiTool';
import { PhoenixEnginePanelProps, CodeComplianceReport, ProjectData } from '../../types/index';
import { analyzeCodeComplianceApi } from '../../services/geminiService';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Pass': return 'text-emerald-400';
        case 'Fail': return 'text-red-400';
        case 'Warning': return 'text-amber-400';
        default: return 'text-slate-400';
    }
};

const renderComplianceResult = (report: CodeComplianceReport) => (
    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg space-y-3">
        <h4 className={`text-lg font-bold ${getStatusColor(report.overallResult)}`}>Result: {report.overallResult}</h4>
        <p className="text-sm">{report.summary}</p>
        <div className="space-y-1">
            {report.items.map((item, i) => (
                <div key={i} className="text-xs">
                    <span className={`font-semibold ${getStatusColor(item.status)}`}>[{item.status}]</span> {item.check}: {item.details}
                </div>
            ))}
        </div>
    </div>
);

export const ComplianceTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { levels, activeLevelIndex } = props;
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');
    const [standard, setStandard] = useState('IRC 2021');
    const activeLevelRooms = levels[activeLevelIndex]?.rooms || [];

    return (
        <div>
            <div className="space-y-3 mb-4">
                 <div>
                    <label htmlFor="room-select" className="block text-sm font-medium text-slate-300 mb-1">Select Room</label>
                    <select id="room-select" value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                        <option value="">-- Select a room --</option>
                        {activeLevelRooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="standard-input" className="block text-sm font-medium text-slate-300 mb-1">Compliance Standard</label>
                    <input type="text" id="standard-input" value={standard} onChange={e => setStandard(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white" />
                </div>
            </div>
             <GenericApiTool
                {...props}
                toolName="Code Compliance"
                description="Check a room against common building codes and standards."
                creditCost={10}
                icon="✅"
                apiFn={analyzeCodeComplianceApi}
                buildPayload={(p): [string, string, ProjectData] | null => {
                    if (!selectedRoomId || !standard.trim()) {
                        p.addNotification('Please select a room and specify a standard.', 'error');
                        return null;
                    }
                    const projectData: ProjectData = { projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] };
                    return [
                        selectedRoomId,
                        standard,
                        projectData
                    ];
                }}
                onSuccess={(result, p) => {
                    const typedResult = result as CodeComplianceReport;
                    p.addNotification(`Compliance check for room complete: ${typedResult.overallResult}`, 'info');
                }}
                buttonText="Run Compliance Check"
                renderResult={renderComplianceResult}
            />
        </div>
    );
};
