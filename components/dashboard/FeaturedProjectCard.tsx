// src/components/dashboard/FeaturedProjectCard.tsx
import React, { useState, useEffect } from 'react';
import { Project } from '../../types/index';
import * as communityService from '../../services/communityService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;
const MotionP = motion.p as any;
const MotionH3 = motion.h3 as any;

export const FeaturedProjectCard: React.FC = () => {
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        communityService.getFeaturedProjectApi()
            .then(data => {
                if (isMounted) setProject(data);
            })
            .catch(err => {
                if (isMounted) {
                    console.warn("Could not load featured project:", err.message);
                    setError("No featured project available this week.");
                }
            })
            .finally(() => { 
                if (isMounted) setIsLoading(false);
            });
        
        return () => { isMounted = false; };
    }, []);

    if (isLoading) {
        return (
            <div className="w-full min-h-[24rem] bg-slate-800/50 rounded-xl border border-slate-700 flex items-center justify-center">
                <LoadingSpinner />
                <span className="ml-3 text-slate-400">Loading Showcase...</span>
            </div>
        )
    }

    if (error || !project) {
        return null;
    }
    
    const folioLink = project.folio?.isEnabled ? `#/folio/${project.folio.shareableLink}` : '#';
    
    const textRevealVariants = {
        hidden: { y: "100%" },
        visible: (i: number = 0) => ({
            y: 0,
            transition: { delay: 0.5 + i * 0.1, duration: 0.8, ease: [0.7, 0, 0.3, 1] }
        })
    };
    
    const projectUserId = (typeof project.userId === 'object' && project.userId !== null) ? project.userId.name : 'AuraOS Architect';

    return (
        <MotionDiv
            className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden premium-glow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* Media Player */}
                <div className="relative lg:col-span-3 bg-slate-900 aspect-video lg:aspect-auto">
                    <video
                        key="featured-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="/videos/hero-poster.jpg"
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src="/videos/hero-visual.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"></div>
                </div>

                {/* Content */}
                <div className="p-6 lg:col-span-2 flex flex-col">
                     <div className="overflow-hidden mb-1">
                        <MotionP className="font-semibold text-primary text-shadow-custom" variants={textRevealVariants} initial="hidden" animate="visible" custom={0}>
                            Featured Project of the Week
                        </MotionP>
                     </div>
                     <div className="overflow-hidden mb-2">
                        <MotionH3 className="text-3xl font-bold text-white mt-1 text-shadow-custom" variants={textRevealVariants} initial="hidden" animate="visible" custom={1}>
                           {project.name}
                        </MotionH3>
                     </div>
                    <p className="text-sm text-slate-400 mt-1 text-shadow-custom">by {projectUserId}</p>
                    
                    <p className="text-sm text-slate-300 my-4 flex-grow text-shadow-custom">
                        { project.folio?.narrative ? 
                            `${project.folio.narrative.substring(0, 150)}...`
                            : 'An exemplary project showcasing the power and elegance of AI-driven design on the AuraOS platform.'
                        }
                    </p>
                    
                    <a href={folioLink} target="_blank" rel="noopener noreferrer" className="w-full mt-6 px-4 py-3 text-center text-white font-semibold rounded-md bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 transition-all flex items-center justify-center gap-2 group">
                        Explore Full Project Folio
                        <span className="transform transition-transform group-hover:translate-x-1">→</span>
                    </a>
                </div>
            </div>
        </MotionDiv>
    );
};
