
// src/features/public-views/pages/KwinCityShowcaseView.tsx
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
const ThreeDScene = React.lazy(() => import('../../../components/kwin-city/ThreeDScene').then(module => ({ default: module.ThreeDScene })));
const InfoPanel = React.lazy(() => import('../../../components/kwin-city/InfoPanel').then(module => ({ default: module.InfoPanel })));

const MotionDiv = motion.div as any;

const KwinCityShowcaseView: React.FC = () => {
    return (
        <div className="w-screen h-screen bg-background text-white flex flex-col lg:flex-row overflow-hidden">
            <div className="lg:w-2/3 h-1/2 lg:h-full">
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div>}>
                    <ThreeDScene />
                </Suspense>
            </div>
            <MotionDiv 
                className="lg:w-1/3 h-1/2 lg:h-full p-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-primary">Kwin City Master Plan</h1>
                    <p className="text-slate-400">A generative urban concept by the AuraOS Master Planner AI.</p>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                    <InfoPanel />
                </Suspense>
            </MotionDiv>
        </div>
    );
};

export default KwinCityShowcaseView;
