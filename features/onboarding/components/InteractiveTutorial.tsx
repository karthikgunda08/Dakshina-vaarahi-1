// src/features/onboarding/components/InteractiveTutorial.tsx
import React, { useState, useLayoutEffect, useRef } from 'react';
import { useAppStore } from '../../../state/appStore';
import { Button } from '../../../components/ui/Button';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

interface TourStep {
  elementId: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const TUTORIAL_STEPS: TourStep[] = [
  {
    elementId: 'tutorial-target-canvas',
    title: 'Welcome to the 2D Sketcher!',
    content: 'This is your creative canvas. Draw walls, add dimensions, and lay out the basic structure of your design here.',
    placement: 'right',
  },
  {
    elementId: 'tutorial-target-3d',
    title: 'Live 3D Visualization',
    content: 'See your plans come to life instantly in this 3D view. Orbit, zoom, or even activate walkthrough mode to experience your space.',
    placement: 'left',
  },
  {
    elementId: 'tutorial-target-phoenix',
    title: 'Your AI Co-Pilot',
    content: 'Click this to open the Phoenix AI Engine panel, where you can access all AI tools for generation, analysis, and more.',
    placement: 'top',
  },
   {
    elementId: 'tutorial-target-save',
    title: 'Save Your Progress',
    content: 'Click here to save a permanent version of your project. It\'s good practice to save often with a descriptive message!',
    placement: 'top',
  },
];

const InteractiveTutorial: React.FC = () => {
    const { onboardingStep, advanceTutorialStep, endInteractiveTutorial } = useAppStore();
    const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const popoverRef = useRef<HTMLDivElement>(null);

    const currentStep = TUTORIAL_STEPS[onboardingStep];

    useLayoutEffect(() => {
        if (!currentStep) return;

        setPopoverStyle({ opacity: 0 }); // Hide while calculating
        const targetElement = document.getElementById(currentStep.elementId);

        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();

            setHighlightStyle({
                top: `${rect.top - 8}px`, left: `${rect.left - 8}px`,
                width: `${rect.width + 16}px`, height: `${rect.height + 16}px`,
            });

            if (popoverRef.current) {
                const popoverRect = popoverRef.current.getBoundingClientRect();
                let top = 0, left = 0;
                const offset = 20;

                switch (currentStep.placement) {
                    case 'top':
                        top = rect.top - popoverRect.height - offset;
                        left = rect.left + rect.width / 2 - popoverRect.width / 2;
                        break;
                    case 'bottom':
                        top = rect.bottom + offset;
                        left = rect.left + rect.width / 2 - popoverRect.width / 2;
                        break;
                    case 'left':
                        top = rect.top + rect.height / 2 - popoverRect.height / 2;
                        left = rect.left - popoverRect.width - offset;
                        break;
                    case 'right': default:
                        top = rect.top + rect.height / 2 - popoverRect.height / 2;
                        left = rect.right + offset;
                        break;
                }

                if (left < 10) left = 10;
                if (top < 10) top = 10;
                if (left + popoverRect.width > window.innerWidth - 10) left = window.innerWidth - popoverRect.width - 10;
                if (top + popoverRect.height > window.innerHeight - 10) top = window.innerHeight - popoverRect.height - 10;
                
                setPopoverStyle({ top: `${top}px`, left: `${left}px`, opacity: 1 });
            }
        }
    }, [currentStep]);

    if (!currentStep) return null;

    return (
        <div className="guided-tour-backdrop">
            <MotionDiv 
                className="guided-tour-highlight" 
                style={highlightStyle} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            />
            <MotionDiv 
                ref={popoverRef} 
                className="guided-tour-popover" 
                style={popoverStyle}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-sky-300">{currentStep.title}</h3>
                    <span className="text-sm text-slate-400">{onboardingStep + 1} / {TUTORIAL_STEPS.length}</span>
                </div>
                <p className="text-sm text-slate-300 mb-6">{currentStep.content}</p>
                <div className="flex justify-between items-center">
                    <Button variant="ghost" size="sm" onClick={endInteractiveTutorial}>Skip Tour</Button>
                    <Button size="sm" onClick={advanceTutorialStep}>
                        {onboardingStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                </div>
            </MotionDiv>
        </div>
    );
};

export default InteractiveTutorial;
