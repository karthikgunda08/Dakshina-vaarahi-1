// src/components/onboarding/FeatureSpotlight.tsx
import React, { useState, useRef, useLayoutEffect } from 'react';
import { useAppStore } from '../../state/appStore';
import { Button } from '../ui/Button';

interface FeatureSpotlightProps {
    spotlightId: string;
    title: string;
    content: string;
    children: React.ReactNode;
}

export const FeatureSpotlight: React.FC<FeatureSpotlightProps> = ({ spotlightId, title, content, children }) => {
    const { seenSpotlights, markSpotlightSeen, completeOnboardingChecklistItem } = useAppStore(state => ({
        seenSpotlights: state.seenSpotlights,
        markSpotlightSeen: state.markSpotlightSeen,
        completeOnboardingChecklistItem: state.completeOnboardingChecklistItem
    }));

    const [isVisible, setIsVisible] = useState(!seenSpotlights.includes(spotlightId));
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const targetRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    
    useLayoutEffect(() => {
        if (isVisible && targetRef.current && popoverRef.current) {
            const targetRect = targetRef.current.getBoundingClientRect();
            const popoverRect = popoverRef.current.getBoundingClientRect();
            
            setPosition({
                top: targetRect.top - popoverRect.height - 10,
                left: targetRect.left + targetRect.width / 2 - popoverRect.width / 2,
            });
        }
    }, [isVisible]);


    const handleDismiss = () => {
        setIsVisible(false);
        markSpotlightSeen(spotlightId);
        completeOnboardingChecklistItem('featureSpotlightViewed');
    };

    return (
        <div ref={targetRef} className="relative">
            {children}
            {isVisible && (
                 <div
                    ref={popoverRef}
                    className="guided-tour-popover z-[1002]"
                    style={{
                        position: 'fixed',
                        top: position.top,
                        left: position.left,
                        opacity: position.top === 0 ? 0 : 1, // Prevent flicker
                    }}
                 >
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-amber-300">{title}</h4>
                        <button onClick={handleDismiss} className="text-slate-500 hover:text-white">&times;</button>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{content}</p>
                    <Button size="sm" onClick={handleDismiss} className="w-full">Got it</Button>
                </div>
            )}
        </div>
    );
};
