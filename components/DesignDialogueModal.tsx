// src/components/DesignDialogueModal.tsx
import React, { useState } from 'react';
import { MasterArchitectResponse, SharedEditorProps } from '../types/index';
import { useNotificationStore } from '../state/notificationStore';
import { refineAndGeneratePlanApi, getDesignClarificationsApi } from '../services/geminiService';
import { LoadingSpinner } from './common/LoadingSpinner';

interface DesignDialogueModalProps extends SharedEditorProps {
  onClose: () => void;
  onApplyConcept: (result: MasterArchitectResponse) => void;
}

type DialogueStep = 'prompt' | 'clarify' | 'generate' | 'result';

interface Clarification {
    key: string;
    question: string;
    placeholder: string;
}

const StepIndicator: React.FC<{ current: DialogueStep }> = ({ current }) => {
    const steps: { id: DialogueStep, name: string }[] = [
        { id: 'prompt', name: 'Your Idea' },
        { id: 'clarify', name: 'Add Details' },
        { id: 'generate', name: 'AI Generation' },
        { id: 'result', name: 'Review Concept' },
    ];
    const currentIndex = steps.findIndex(s => s.id === current);

    return (
        <div className="flex items-center justify-center mb-6">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            index <= currentIndex ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-400'
                        }`}>
                            {index < currentIndex ? '✓' : index + 1}
                        </div>
                        <p className={`text-xs mt-1 transition-colors ${
                            index <= currentIndex ? 'text-amber-300' : 'text-slate-400'
                        }`}>{step.name}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                             index < currentIndex ? 'bg-amber-500' : 'bg-slate-700'
                        }`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

const DesignDialogueModal: React.FC<DesignDialogueModalProps> = (props) => {
  const {
    onClose,
    onApplyConcept,
    currentUser, 
    setBuyCreditsModalOpen, 
    refreshCurrentUser, 
    currentProject
  } = props;

  const [step, setStep] = useState<DialogueStep>('prompt');
  const [initialPrompt, setInitialPrompt] = useState('A 2bhk vastu home for a small family.');
  const [clarifications, setClarifications] = useState<Clarification[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MasterArchitectResponse | null>(null);
  const { addNotification } = useNotificationStore();
  
  const handleAnswerChange = (key: string, value: string) => {
      setAnswers(prev => ({...prev, [key]: value}));
  };

  const handlePromptSubmit = async () => {
      if (!initialPrompt.trim()) return;
      setIsLoading(true);
      setError(null);
      try {
          const questions = await getDesignClarificationsApi(currentProject?.id || '', initialPrompt);
          setClarifications(questions);
          // Initialize answers with empty strings
          const initialAnswers = questions.reduce((acc, q) => ({...acc, [q.key]: ''}), {});
          setAnswers(initialAnswers);
          setStep('clarify');
      } catch (err: any) {
          setError(err.message);
          addNotification(err.message, 'error');
      } finally {
          setIsLoading(false);
      }
  };

  const handleClarificationSubmit = async () => {
    if (!currentUser) {
      addNotification("Please log in to use this feature.", "error");
      return;
    }
    if (currentUser.role !== 'owner' && currentUser.credits < 100) {
      addNotification(`You need 100 credits. You have ${currentUser.credits}.`, "info");
      setBuyCreditsModalOpen(true);
      return;
    }
    
    setIsLoading(true);
    setStep('generate');
    setError(null);
    setResult(null);

    // Synthesize the final, detailed prompt
    const detailedPrompt = [
        initialPrompt,
        ...clarifications.map(c => `${c.question}\n- ${answers[c.key] || 'Not specified.'}`)
    ].join('\n\n');

    try {
      const response = await refineAndGeneratePlanApi(currentProject?.id || '', detailedPrompt);
      setResult(response);
      setStep('result');
      addNotification("Master Architect has generated a full project concept!", "success");
      await refreshCurrentUser();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      addNotification(err.message, 'error');
      setStep('clarify'); // Go back to the form on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if(result) {
        onApplyConcept(result);
        onClose();
    }
  };
  
  const renderContent = () => {
      switch(step) {
          case 'prompt':
              return (
                  <div>
                      <h3 className="text-xl font-semibold text-center mb-2">What's on your mind?</h3>
                      <p className="text-sm text-slate-300 mb-4 text-center">Start with a simple idea. The AI will ask for more details next.</p>
                      <textarea
                          value={initialPrompt}
                          onChange={(e) => setInitialPrompt(e.target.value)}
                          rows={4}
                          className="w-full p-3 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-amber-500"
                          placeholder="e.g., 'A modern G+1 Vastu home' or 'एक आधुनिक जी+1 वास्तु घर'"
                          autoFocus
                      />
                      <button
                          onClick={handlePromptSubmit}
                          disabled={isLoading || !initialPrompt.trim()}
                          className="w-full mt-4 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-amber-600 hover:bg-amber-500"
                      >
                          {isLoading ? <LoadingSpinner size="h-5 w-5" /> : 'Next: Add Details'}
                      </button>
                  </div>
              );
          case 'clarify':
              return (
                   <div>
                       <h3 className="text-xl font-semibold text-center mb-2">Let's refine the vision.</h3>
                       <p className="text-sm text-slate-300 mb-4 text-center">The AI suggests these questions to create a better design.</p>
                       <div className="space-y-4">
                           {clarifications.map(c => (
                               <div key={c.key}>
                                   <label className="block text-sm font-medium text-slate-300 mb-1">{c.question}</label>
                                   <input type="text" value={answers[c.key]} onChange={(e) => handleAnswerChange(c.key, e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" placeholder={c.placeholder} />
                               </div>
                           ))}
                       </div>
                       <button
                           onClick={handleClarificationSubmit}
                           className="w-full mt-6 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                       >
                           Generate Concept (100 credits)
                       </button>
                   </div>
              );
          case 'generate':
              return (
                  <div className="text-center p-8">
                       <LoadingSpinner size="h-12 w-12" color="text-amber-400" />
                       <h3 className="text-xl font-semibold mt-4">Generating Master Concept...</h3>
                       <p className="text-sm text-slate-400">The AI is creating a floor plan, running structural analysis, checking Vastu, and generating a preview render. This may take a moment.</p>
                  </div>
              );
          case 'result':
              return (
                   <div>
                        <h3 className="text-xl font-semibold text-center mb-2">Concept Ready for Review</h3>
                        {result && (
                            <div className="mt-4 space-y-4">
                                <div className="text-center">
                                    <img src={result.previewRender.imageUrl} alt="AI generated preview" className="w-full rounded-lg shadow-lg my-2" />
                                    <p className="text-sm text-slate-300">{result.summary}</p>
                                </div>
                                <button onClick={handleApply} className="w-full mt-4 px-4 py-3 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md">
                                    Apply this Concept to Editor
                                </button>
                            </div>
                        )}
                   </div>
              );
      }
  }

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-amber-300">AI Design Dialogue</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-sky-300 transition-colors" aria-label="Close modal">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <StepIndicator current={step} />
        
        <div className="flex-grow overflow-y-auto pr-2">
            {error && <p className="text-red-400 text-xs mt-2 text-center bg-red-900/50 p-2 rounded-md mb-4">{error}</p>}
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DesignDialogueModal;