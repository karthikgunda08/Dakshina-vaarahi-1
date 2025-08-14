// src/components/common/JsonReportDisplay.tsx
import React from 'react';

interface JsonReportDisplayProps {
  data: object | string | null;
  title?: string;
}

export const JsonReportDisplay: React.FC<JsonReportDisplayProps> = ({ data, title }) => {
  if (!data) return null;

  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  return (
    <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
      {title && <h4 className="font-semibold text-slate-200 mb-2">{title}</h4>}
      <pre className="text-xs text-slate-300 whitespace-pre-wrap overflow-x-auto">
        <code>{jsonString}</code>
      </pre>
    </div>
  );
};