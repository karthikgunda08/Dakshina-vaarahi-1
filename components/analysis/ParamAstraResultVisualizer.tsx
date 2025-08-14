// src/components/analysis/ParamAstraResultVisualizer.tsx
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ParamAstraResponse } from '../../types/index';

interface ParamAstraResultVisualizerProps {
  report: ParamAstraResponse;
}

const CustomTooltipContent: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-slate-800/90 border border-slate-600 rounded-lg shadow-xl text-sm">
        <p className="font-bold text-slate-100 mb-2">Solution ID: {data.id}</p>
        <div className="space-y-1">
          {Object.entries(data.scores).map(([key, value]) => (
            <p key={key} className="text-slate-300">
              <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
              <span className="font-semibold text-amber-300 ml-2">{value as number}/100</span>
            </p>
          ))}
        </div>
        <img src={data.thumbnailUrl} alt={`Thumbnail for ${data.id}`} className="mt-2 rounded-md border-2 border-slate-700" />
      </div>
    );
  }
  return null;
};

export const ParamAstraResultVisualizer: React.FC<ParamAstraResultVisualizerProps> = ({ report }) => {
  if (!report || !report.solutions || report.solutions.length === 0) {
    return <p className="text-slate-400">No optimal solutions were found.</p>;
  }

  const objectives = Object.keys(report.solutions[0].scores);
  const xAxisKey = objectives[0] || 'score1';
  const yAxisKey = objectives[1] || 'score2';

  const data = report.solutions.map(sol => ({
    id: sol.id,
    [xAxisKey]: sol.scores[xAxisKey],
    [yAxisKey]: sol.scores[yAxisKey],
    ...sol.scores,
    thumbnailUrl: sol.thumbnailUrl,
  }));

  return (
    <div className="mt-4 p-2 bg-slate-900/50 rounded-lg">
      <h4 className="font-semibold text-amber-300 text-center mb-2">Mandala of Optimization</h4>
      <p className="text-xs text-slate-400 text-center mb-4">Each point represents an optimal design. Hover to view details.</p>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis 
              type="number" 
              dataKey={xAxisKey} 
              name={xAxisKey.replace(/_/g, ' ')} 
              unit="" 
              tick={{ fill: '#94a3b8', fontSize: 10 }} 
              label={{ value: xAxisKey.replace(/_/g, ' '), position: 'insideBottom', offset: -10, fill: '#cbd5e1' }}
            />
            <YAxis 
              type="number" 
              dataKey={yAxisKey} 
              name={yAxisKey.replace(/_/g, ' ')} 
              unit="" 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              label={{ value: yAxisKey.replace(/_/g, ' '), angle: -90, position: 'insideLeft', fill: '#cbd5e1' }}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#a78bfa' }} content={<CustomTooltipContent />} />
            <Scatter name="Solutions" data={data} fill="#f59e0b" shape="star" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
