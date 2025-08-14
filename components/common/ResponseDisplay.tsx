// src/components/common/ResponseDisplay.tsx
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ResponseDisplayProps {
    isLoading: boolean;
    error: string | null;
    result: any | null; // The data to display on success
    renderResult: (result: any) => React.ReactNode;
    placeholder?: React.ReactNode;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ isLoading, error, result, renderResult, placeholder }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-4 text-center">
                <LoadingSpinner />
                <p className="text-sm text-slate-400 mt-2">AI is thinking...</p>
            </div>
        );
    }

    if (error) {
        return <p className="p-4 text-sm text-red-400 bg-red-900/50 rounded-md">{error}</p>;
    }

    if (result) {
        return (
            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg animate-fade-in-up">
                {renderResult(result)}
            </div>
        );
    }
    
    if (placeholder) {
        return <>{placeholder}</>;
    }

    return null;
};