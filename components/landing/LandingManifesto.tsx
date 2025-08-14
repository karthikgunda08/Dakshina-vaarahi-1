// src/components/landing/LandingManifesto.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroVisuals } from './HeroVisuals';
import { DakshinVaarahiLogo } from '../icons/DakshinVaarahiLogo';

const MotionDiv = motion.div as any;

interface LandingManifestoProps {
    onGetStarted: () => void;
}

const manifestoSteps = [
    {
        key: 'spark',
        preHeading: 'The Spark',
        heading: 'From a single thought...',
        subheading: "Describe your vision. A whisper of an idea is all it takes to ignite the Genesis Engine.",
        promptText: "A cyber-vastu data temple for a new digital deity...",
        duration: 4000
    },
    {
        key: 'genesis',
        preHeading: 'The Genesis',
        heading: '...a new reality is born.',
        subheading: "Our AI re-engineers your idea from first principles into structurally sound blueprints and 3D models.",
        duration: 4000
    },
    {
        key: 'intelligence',
        preHeading: 'The Intelligence',
        heading: 'Infused with profound insight.',
        subheading: "Instantly analyze your design for structural integrity, Vastu compliance, sustainability, and cost.",
        duration: 4000
    },
    {
        key: 'beauty',
        preHeading: 'The Beauty',
        heading: 'Transformed into emotion.',
        subheading: "The Helios Engine crafts photorealistic renders and cinematic tours that communicate the soul of your project.",
        duration: 4000
    },
    {
        key: 'empire',
        preHeading: 'The Empire',
        heading: 'Engineered for legacy.',
        subheading: "Bridge the digital and physical with one-click GFC drawings, fabrication files, and supply chain logistics.",
        duration: 5000
    },
    {
        key: 'final_cta',
        preHeading: 'Dakshin Vaarahi',
        heading: 'Architecting Reality.',
        subheading: 'The definitive end-to-end AI operating system for AEC. Your revolt against inefficiency starts now.',
        duration: Infinity
    },
];

export const LandingManifesto: React.FC<LandingManifestoProps> = ({ onGetStarted }) => {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const currentStep = manifestoSteps[stepIndex];
        if (currentStep.duration === Infinity) return;

        const timer = setTimeout(() => {
            setStepIndex((prevIndex) => (prevIndex + 1) % manifestoSteps.length);
        }, currentStep.duration);

        return () => clearTimeout(timer);
    }, [stepIndex]);

    const currentStepData = manifestoSteps[stepIndex];

    const textContainerVariants = {
        hidden: { },
        visible: {
            transition: {
                staggerChildren: 0.2
            }
        },
        exit: {
            transition: {
                staggerChildren: 0.1,
                staggerDirection: -1
            }
        }
    };

    const textChildVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: 'easeIn' } }
    };


    return (
        <section className="relative h-screen min-h-[700px] flex items-center justify-center text-center text-white overflow-hidden">
            <HeroVisuals visualKey={currentStepData.key} promptText={currentStepData.promptText} />
            
            <div className="relative z-10 flex flex-col items-center p-4">
                <AnimatePresence mode="wait">
                    <MotionDiv
                        key={stepIndex}
                        variants={textContainerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <MotionDiv variants={textChildVariants}>
                            <p className="text-primary font-semibold tracking-wider">{currentStepData.preHeading}</p>
                        </MotionDiv>
                        
                        <MotionDiv variants={textChildVariants}>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mt-2 text-shadow-custom leading-tight">
                                {currentStepData.heading}
                            </h1>
                        </MotionDiv>

                        <MotionDiv variants={textChildVariants}>
                             <p className="max-w-2xl mt-4 text-lg md:text-xl text-slate-300 text-shadow-custom">
                                {currentStepData.subheading}
                            </p>
                        </MotionDiv>
                    </MotionDiv>
                </AnimatePresence>

                 <AnimatePresence>
                    {currentStepData.key === 'final_cta' && (
                        <MotionDiv
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                        >
                            <Button size="lg" onClick={onGetStarted} className="mt-8 px-10 py-7 text-lg premium-glow">
                                Launch The Studio
                            </Button>
                        </MotionDiv>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};