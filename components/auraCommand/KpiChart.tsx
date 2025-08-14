// src/components/auraCommand/KpiChart.tsx
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';
import { KpiChartData } from '../../types/index';

interface KpiChartProps {
    data: KpiChartData[];
}

const KpiChart: React.FC<KpiChartProps> = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis yAxisId="left" stroke="#818cf8" label={{ value: 'Users', angle: -90, position: 'insideLeft', fill: '#818cf8' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#fcd34d" label={{ value: 'Revenue (₹)', angle: -90, position: 'insideRight', fill: '#fcd34d' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.5rem',
                        }}
                        labelStyle={{ color: '#cbd5e1' }}
                    />
                    <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                    <Line yAxisId="left" type="monotone" dataKey="users" stroke="#818cf8" strokeWidth={2} name="New Users" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#fcd34d" strokeWidth={2} name="Revenue" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default KpiChart;