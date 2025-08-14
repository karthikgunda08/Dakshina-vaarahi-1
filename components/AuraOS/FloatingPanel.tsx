// src/components/AuraOS/FloatingPanel.tsx
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { PanelState } from '../../types';

interface FloatingPanelProps {
    title: string;
    panelState: PanelState;
    setPanelState: React.Dispatch<React.SetStateAction<PanelState>>;
    onFocus: () => void;
    children: React.ReactNode;
}

const MotionDiv = motion.div as any;

export const FloatingPanel: React.FC<FloatingPanelProps> = ({ title, panelState, setPanelState, onFocus, children }) => {
    const constraintsRef = useRef<HTMLDivElement>(null);

    return (
        <>
        <div ref={constraintsRef} className="fixed inset-0 pointer-events-none" />
        <MotionDiv
            drag
            dragConstraints={constraintsRef}
            dragMomentum={false}
            dragElastic={0.05}
            onDragStart={onFocus}
            className="aura-floating-panel"
            style={{
                x: panelState.x,
                y: panelState.y,
                width: panelState.width,
                height: panelState.height,
                zIndex: panelState.zIndex,
            }}
            onDrag={(event: MouseEvent, info: any) => {
                setPanelState(p => ({...p, x: p.x + info.delta.x, y: p.y + info.delta.y }));
            }}
        >
            <div className="aura-floating-panel-header">
                <h3 className="font-semibold text-sm text-slate-200">{title}</h3>
                {/* Add close button if needed */}
            </div>
            <div className="aura-floating-panel-content">
                {children}
            </div>
        </MotionDiv>
        </>
    );
};
