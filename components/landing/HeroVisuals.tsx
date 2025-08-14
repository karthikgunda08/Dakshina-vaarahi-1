// src/components/landing/HeroVisuals.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DakshinVaarahiLogo } from '../icons/DakshinVaarahiLogo';

const defaultTransition = { duration: 0.8, ease: 'easeInOut' } as const;

const MotionDiv = motion.div as any;
const MotionPath = motion.path as any;

const SparkVisual: React.FC<{ promptText?: string }> = ({ promptText }) => {
    const [typedText, setTypedText] = useState('');

    useEffect(() => {
        if (!promptText) return;
        setTypedText('');
        let i = 0;
        const intervalId = setInterval(() => {
            setTypedText(promptText.slice(0, i + 1));
            i++;
            if (i >= promptText.length) {
                clearInterval(intervalId);
            }
        }, 50);
        return () => clearInterval(intervalId);
    }, [promptText]);

    return (
        <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={defaultTransition}
            className="w-full h-full flex items-center justify-center"
        >
            <div className="p-4 bg-black/30 rounded-lg">
                <p className="font-mono text-2xl sm:text-3xl text-slate-100 typing-cursor">{typedText}</p>
            </div>
        </MotionDiv>
    );
};

const GenesisVisual: React.FC = () => (
    <MotionDiv
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={defaultTransition}
        className="w-full h-full flex items-center justify-center"
    >
        <svg viewBox="0 0 500 400" className="w-4/5 max-w-2xl h-auto">
            <g stroke="#94a3b8" strokeWidth="2" fill="none" className="landing-draw-line">
                <rect x="50" y="50" width="400" height="300" />
                <line x1="200" y1="50" x2="200" y2="200" />
                <line x1="50" y1="200" x2="450" y2="200" />
                <line x1="300" y1="200" x2="300" y2="350" />
            </g>
        </svg>
    </MotionDiv>
);

const IntelligenceVisual: React.FC = () => {
    const gridVariants = {
        visible: { transition: { staggerChildren: 0.02 } }
    };
    const cellVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    };
    const pathVariants = {
        hidden: { pathLength: 0 },
        visible: { pathLength: 1 }
    };
    return (
        <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={defaultTransition}
            className="w-full h-full flex items-center justify-center"
        >
            <div className="relative w-4/5 max-w-2xl aspect-[5/4]">
                <MotionDiv 
                  className="absolute inset-0 grid grid-cols-10 grid-rows-8 gap-1"
                  variants={gridVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {[...Array(80)].map((_, i) => (
                      <MotionDiv 
                        key={i} 
                        className="bg-primary/10"
                        variants={cellVariants}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            delay: Math.random() * 2,
                            ease: 'easeInOut'
                        }}
                      />
                  ))}
                </MotionDiv>
                <motion.svg
                    viewBox="0 0 500 400" className="w-full h-full absolute inset-0"
                >
                    <MotionPath
                        d="M 50,100 C 150,50 350,150 450,120"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        fill="none"
                        variants={pathVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 1, duration: 1.5, ease: 'easeInOut' }}
                    />
                </motion.svg>
            </div>
        </MotionDiv>
    );
};


const BeautyVisual: React.FC = () => (
    <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={defaultTransition}
        className="w-full h-full bg-cover bg-center" style={{backgroundImage: `url(/videos/hero-poster.jpg)`}}
    />
);

const EmpireVisual: React.FC = () => (
    <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={defaultTransition}
        className="w-full h-full bg-cover bg-center" style={{backgroundImage: `url(/images/social-share.png)`}}
    />
);

const RevoltVisual: React.FC = () => {
    const pulseVariants = {
        visible: (i: number) => ({
            scale: [1, 1.5 + i * 0.5, 1],
            opacity: [0.5 - i * 0.2, 0, 0.5 - i * 0.2]
        })
    };
    const logoContainerVariants = {
        hidden: { scale: 0.5 },
        visible: { scale: 1 }
    };
    return (
        <MotionDiv
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={defaultTransition}
            className="w-full h-full flex items-center justify-center relative"
        >
            <MotionDiv
                className="absolute"
                variants={pulseVariants}
                animate="visible"
                custom={0}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="w-64 h-64 rounded-full border-2 border-primary/50" />
            </MotionDiv>
            <MotionDiv
                className="absolute"
                variants={pulseVariants}
                animate="visible"
                custom={1}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
                <div className="w-64 h-64 rounded-full border border-primary/30" />
            </MotionDiv>
           <MotionDiv 
                className="w-32 h-32"
                variants={logoContainerVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1.5, type: 'spring' }}
            >
                <DakshinVaarahiLogo className="w-full h-full" />
           </MotionDiv>
        </MotionDiv>
    );
};

export const HeroVisuals: React.FC<{ visualKey: string, promptText?: string }> = ({ visualKey, promptText }) => {
  return (
    <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/70 z-10"></div>
        <AnimatePresence mode="wait">
            <MotionDiv
                key={visualKey}
                className="absolute inset-0 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                {visualKey === 'spark' && <SparkVisual promptText={promptText} />}
                {visualKey === 'genesis' && <GenesisVisual />}
                {visualKey === 'intelligence' && <IntelligenceVisual />}
                {visualKey === 'beauty' && <BeautyVisual />}
                {visualKey === 'empire' && <EmpireVisual />}
                {visualKey === 'final_cta' && <RevoltVisual />}
            </MotionDiv>
        </AnimatePresence>
    </div>
  );
};