// src/components/community/PublicProfileView.tsx
import React, { useState, useEffect } from 'react';
import { User, ProjectSummary } from '../../types/index';
import * as communityService from '../../services/communityService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';

interface PublicProfileViewProps {
    userId: string;
}

const PublicProfileView: React.FC<PublicProfileViewProps> = ({ userId }) => {
    const [userData, setUserData] = useState<{ user: User, projects: ProjectSummary[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        communityService.getPublicUserProfile(userId)
            .then(data => { if (isMounted) setUserData(data); })
            .catch(err => { if (isMounted) setError(err.message || "Could not load this user's profile."); })
            .finally(() => { if (isMounted) setIsLoading(false); });

        return () => { isMounted = false; };
    }, [userId]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex-grow flex items-center justify-center"><LoadingSpinner /></div>;
        }

        if (error || !userData) {
            return <div className="flex-grow flex items-center justify-center text-red-400">{error || 'Profile not found.'}</div>;
        }

        const { user, projects } = userData;
        
        return (
             <main className="flex-grow">
                <header className="bg-slate-800/50 py-12 md:py-20">
                    <div className="container mx-auto px-4 text-center">
                        <img 
                            src={user.profileImageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${user.name || user.email}`} 
                            alt={user.name || 'User Avatar'}
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto border-4 border-slate-700 shadow-lg"
                        />
                        <h1 className="text-3xl md:text-4xl font-bold mt-4">{user.name || 'Anonymous Architect'}</h1>
                        <p className="text-lg text-sky-300">{user.profession}</p>
                        <p className="mt-4 max-w-2xl mx-auto text-slate-300">{user.bio}</p>
                        <div className="mt-6 flex justify-center gap-4">
                            {user.portfolioUrl && <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-semibold rounded-md bg-slate-700 hover:bg-slate-600">Portfolio</a>}
                            {user.linkedInUrl && <a href={user.linkedInUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-semibold rounded-md bg-slate-700 hover:bg-slate-600">LinkedIn</a>}
                        </div>
                    </div>
                </header>
                <div className="container mx-auto px-4 py-12">
                    <h2 className="text-2xl font-bold mb-8">Showcased Projects</h2>
                     {projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {projects.map(p => (
                                    <div key={p.id} className="bg-slate-800/50 rounded-lg shadow-lg flex flex-col overflow-hidden transition-all duration-300 hover:shadow-cyan-900/50 hover:-translate-y-1 border border-slate-700">
                                        <div className="h-48 bg-slate-700">
                                            {p.previewImageUrl ? (
                                                <img src={p.previewImageUrl} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className={`w-full h-full bg-gradient-to-br ${p.projectType === 'masterPlan' ? 'from-indigo-500 to-purple-600' : 'from-sky-500 to-cyan-600'} flex items-center justify-center text-5xl opacity-50`}>
                                                    {p.projectType === 'masterPlan' ? '🗺️' : '🏢'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex-grow flex flex-col">
                                            <h3 className="font-semibold text-slate-100 truncate flex-grow" title={p.name}>{p.name}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-slate-400">
                               <p>This user hasn't showcased any projects yet.</p>
                            </div>
                        )
                    }
                </div>
            </main>
        );
    };


    return (
        <div className="bg-slate-900 min-h-screen text-slate-200 flex flex-col">
            <Header />
            {renderContent()}
            <Footer />
        </div>
    );
};

export default PublicProfileView;