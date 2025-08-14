
// src/components/dashboard/LaunchSequence.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../state/appStore';
import { DakshinVaarahiLogo } from '../icons/DakshinVaarahiLogo';

const sequenceSteps = [
    { text: 'INITIALIZING AURAOS CORE...', duration: 1200 },
    { text: 'SYNCHRONIZING WITH GENESIS ENGINE...', duration: 1200 },
    { text: 'CALIBRATING HELIOS RENDER FARMS...', duration: 1200 },
    { text: 'AWAKENING BRAHMA-ASTRA PROTOCOL...', duration: 1500 },
    { text: 'AUTHENTICATING FOUNDER...', duration: 1000 },
    { text: 'GRANTING FOUNDER-LEVEL CLEARANCE...', duration: 1500 },
    { text: 'ALLOCATING 100 COMPLIMENTARY AI CREDITS...', duration: 2000 },
    { text: 'COMPLETE YOUR FIRST MISSION FOR A BONUS.', duration: 3000 },
];

const MotionDiv = motion.div as any;
const MotionP = motion.p as any;

const LaunchSequence: React.FC = () => {
    const { currentUser, setLaunchSequenceActive } = useAppStore(state => ({
        currentUser: state.currentUser,
        setLaunchSequenceActive: state.setLaunchSequenceActive,
    }));
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < sequenceSteps.length - 1) {
            const timer = setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
            }, sequenceSteps[currentIndex].duration);
            return () => clearTimeout(timer);
        } else if (currentIndex === sequenceSteps.length - 1) {
            const closeTimer = setTimeout(() => {
                 setLaunchSequenceActive(false);
            }, sequenceSteps[currentIndex].duration);
            return () => clearTimeout(closeTimer);
        }
    }, [currentIndex, setLaunchSequenceActive]);

    const text = sequenceSteps[currentIndex].text === 'AUTHENTICATING FOUNDER...'
        ? `AUTHENTICATING FOUNDER: ${currentUser?.name || currentUser?.email || 'GUEST'}`
        : sequenceSteps[currentIndex].text;

    return (
        <MotionDiv
            className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center animated-gradient-bg"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5, delay: 0.5 } }}
        >
            <MotionDiv 
                className="w-32 h-auto mb-8"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 1, delay: 0.5 }}}
            >
                <DakshinVaarahiLogo />
            </MotionDiv>
            <AnimatePresence mode="wait">
                <MotionP
                    key={currentIndex}
                    className="font-mono text-lg md:text-2xl text-primary tracking-widest text-shadow-custom"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {text}
                </MotionP>
            </AnimatePresence>
        </MotionDiv>
    );
};

export default LaunchSequence;
