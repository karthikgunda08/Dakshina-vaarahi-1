// src/features/tools/BoqTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, BillOfQuantitiesReport, GeneratedDocument, BoqItem, ProjectData } from '../../types/index';
import { generateBoqApi } from '../../services/geminiService';
import { addProjectDocument } from '../../services/projectService';
import { GenericApiTool } from './misc/GenericApiTool';
import * as astraService from '../../services/astraService'; // NEW
import { useNotificationStore } from '../../state/notificationStore'; // NEW
import { LoadingSpinner } from '../../components/common/LoadingSpinner'; // NEW

const BoqResultDisplay: React.FC<{ report: BillOfQuantitiesReport, projectId: string }> = ({ report, projectId }) => {
    const [isRfqLoading, setIsRfqLoading] = useState(false);
    const { addNotification } = useNotificationStore();

    const handleRequestQuotes = async () => {
        setIsRfqLoading(true);
        try {
            const result = await astraService.createRfqForProject(projectId, report.lineItems);
            addNotification(result.message, 'success');
        } catch (error: any) {
            addNotification(error.message, 'error');
        } finally {
            setIsRfqLoading(false);
        }
    };
    
    return (
        <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
            <h4 className="font-semibold text-slate-200 mb-2">BoQ Summary: <span className="text-base text-slate-300">{report.summary}</span></h4>
            <div className="max-h-60 overflow-y-auto pr-1">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/50 sticky top-0">
                        <tr>
                            <th className="p-2">Item</th><th className="p-2">Quantity</th><th className="p-2">Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.lineItems.map((item, i) => (
                            <tr key={i} className="border-b border-slate-700">
                                <td className="p-2">{item.item}</td><td className="p-2">{item.quantity.toFixed(2)}</td><td className="p-2">{item.unit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                onClick={handleRequestQuotes}
                disabled={isRfqLoading}
                className="w-full mt-3 px-4 py-2 text-sm font-semibold text-white rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
                {isRfqLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : '🔗'}
                {isRfqLoading ? 'Sending RFQ...' : 'Request Quotes on Astra Network'}
            </button>
        </div>
    );
};

export const BoqTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    return (
        <GenericApiTool
            {...props}
            toolName="Bill of Quantities"
            description="Generate a preliminary Bill of Quantities (BoQ) for your project based on the current design."
            creditCost={15}
            icon="🧾"
            apiFn={generateBoqApi}
            buildPayload={(p): [ProjectData] | null => {
                if (!p.currentProject) {
                    p.addNotification("Please save your project before generating a BoQ.", "error");
                    return null;
                }
                const projectData: ProjectData = { projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] };
                return [projectData];
            }}
            onSuccess={async (result, p) => {
                const typedResult = result as BillOfQuantitiesReport;
                p.setBillOfQuantities(typedResult);
                if (p.currentProject) {
                    const blob = new Blob([JSON.stringify(typedResult, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const newDocument: Omit<GeneratedDocument, '_id' | 'createdAt'> = {
                        name: `BoQ_${new Date().toLocaleDateString()}.json`,
                        type: 'Bill of Quantities',
                        url,
                    };
                    const updatedDocs = await addProjectDocument(p.currentProject.id, newDocument);
                    p.updateCurrentProject({ generatedDocuments: updatedDocs });
                    p.addNotification("BoQ generated and saved to Project Hub.", "success");
                }
            }}
            buttonText="Generate Bill of Quantities"
            renderResult={(result) => <BoqResultDisplay report={result as BillOfQuantitiesReport} projectId={props.currentProject?.id || ''} />}
        />
    );
};