// src/components/community/CommunityShowcase.tsx
import React, { useState, useEffect } from 'react';
import { ProjectSummary } from '../../types/index';
import * as communityService from '../../services/communityService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { motion } from 'framer-motion';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';

const MotionDiv = motion.div as any;

const ProjectCard: React.FC<{ project: ProjectSummary }> = ({ project }) => {
    const authorLink = project.userId ? `#/profiles/${project.userId.id}` : '#';
    const folioLink = project.folio?.isEnabled ? `#/folio/${project.folio.shareableLink}` : '#';

    return (
        <div className="bg-slate-800/50 rounded-lg shadow-lg flex flex-col overflow-hidden transition-all duration-300 hover:shadow-cyan-900/50 hover:-translate-y-1 border border-slate-700">
            <a href={folioLink} className="block h-48 bg-slate-700 group">
                {project.previewImageUrl ? (
                    <img src={project.previewImageUrl} alt={project.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                     <div className={`w-full h-full bg-gradient-to-br ${project.projectType === 'masterPlan' ? 'from-brand-indigo to-brand-purple' : 'from-sky-500 to-cyan-600'} flex items-center justify-center text-5xl opacity-50`}>
                        {project.projectType === 'masterPlan' ? '🗺️' : '🏢'}
                     </div>
                )}
            </a>
            <div className="p-4 flex-grow flex flex-col">
                <a href={folioLink} className="font-semibold text-slate-100 truncate flex-grow hover:text-primary transition-colors" title={project.name}>{project.name}</a>
                {project.userId && (
                    <a href={authorLink} className="text-xs text-slate-400 hover:text-sky-300 transition-colors mt-1 font-body">
                        by {project.userId.name || 'Anonymous Architect'}
                    </a>
                )}
            </div>
        </div>
    );
};


const CommunityShowcase: React.FC = () => {
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        communityService.getPublicProjects()
            .then(data => { if (isMounted) setProjects(data); })
            .catch(err => { if (isMounted) setError(err.message || 'Could not load projects.'); })
            .finally(() => { if (isMounted) setIsLoading(false); });
        
        return () => { isMounted = false; };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow animated-gradient-bg-studio">
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white text-shadow-custom">Aura Showcase</h1>
                        <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">Explore incredible designs created by the AuraOS community.</p>
                    </div>

                    {isLoading && <div className="flex justify-center p-8"><LoadingSpinner /></div>}
                    {error && <p className="text-center text-red-400">{error}</p>}

                    {!isLoading && !error && (
                        projects.length > 0 ? (
                            <MotionDiv
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {projects.map(p => (
                                    <MotionDiv key={p.id} variants={itemVariants}>
                                        <ProjectCard project={p} />
                                    </MotionDiv>
                                ))}
                            </MotionDiv>
                        ) : (
                            <div className="text-center py-16 text-slate-400">
                               <p>No public projects in the showcase yet. Be the first!</p>
                            </div>
                        )
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CommunityShowcase;