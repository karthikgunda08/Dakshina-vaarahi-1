// src/components/dashboard/ProjectDashboard.tsx
import React, { useEffect } from 'react';
import { useAppStore } from '../../state/appStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ProjectList, MissionControlPanel, UserHeader } from './DashboardComponents';
import { motion } from 'framer-motion';
import { NexusAdvisorDashboardCard } from './NexusAdvisorDashboardCard';
import { FeaturedProjectCard } from './FeaturedProjectCard';
import DashboardChecklist from '../onboarding/DashboardChecklist';
import { AppStore } from '../../types';

const MotionDiv = motion.div as any;

const ProjectDashboard: React.FC = () => {
    const { 
        currentUser, projects, userAnalytics,
        fetchUserAnalytics
    } = useAppStore((state: AppStore) => ({
        currentUser: state.currentUser,
        projects: state.projects,
        userAnalytics: state.userAnalytics,
        fetchUserAnalytics: state.fetchUserAnalytics,
    }));

    useEffect(() => {
        if (currentUser && !userAnalytics) {
            fetchUserAnalytics();
        }
    }, [currentUser, userAnalytics, fetchUserAnalytics]);

    if (!currentUser) {
        return <div className="flex-grow flex items-center justify-center animated-gradient-bg-studio"><LoadingSpinner /></div>;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
      <MotionDiv
        className="flex-grow h-full animated-gradient-bg-studio"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <UserHeader currentUser={currentUser} />
                
                <MotionDiv variants={itemVariants}>
                    <DashboardChecklist />
                </MotionDiv>
                
                <MotionDiv variants={itemVariants}>
                    <FeaturedProjectCard />
                </MotionDiv>
                
                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Sidebar Column */}
                    <MotionDiv variants={itemVariants} className="lg:col-span-4 lg:sticky lg:top-8">
                        <MissionControlPanel currentUser={currentUser} userAnalytics={userAnalytics} />
                    </MotionDiv>

                    {/* Main Content Column */}
                    <div className="lg:col-span-8 space-y-8">
                        <MotionDiv variants={itemVariants}>
                            <NexusAdvisorDashboardCard projects={projects} />
                        </MotionDiv>
                        <MotionDiv variants={itemVariants}>
                            <ProjectList projects={projects} />
                        </MotionDiv>
                    </div>

                </div>
            </div>
        </main>
      </MotionDiv>
    );
};

export default ProjectDashboard;
