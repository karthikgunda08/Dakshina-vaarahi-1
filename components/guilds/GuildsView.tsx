// src/components/guilds/GuildsView.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Guild, BrahmanTierProject } from '../../types/index';
import { useAppStore } from '../../state/appStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const MotionDiv = motion.div as any;

const mockAvailableProjects: BrahmanTierProject[] = [
  {
    id: 'proj_brahman_3',
    title: 'Ganges Riverfront Rejuvenation',
    description: 'A large-scale urban and ecological renewal project in Varanasi.',
    budget: 'National Scale',
    timeline: '5 Years',
    requiredSkills: ['Urban Planning', 'Hydro-Engineering', 'Cultural Heritage']
  },
  {
    id: 'proj_brahman_4',
    title: 'Project Citadel',
    description: 'Design a next-generation, secure data-haven powered by geothermal energy in Iceland.',
    budget: 'Confidential',
    timeline: '24 Months',
    requiredSkills: ['Secure Facilities', 'Sustainable Energy', 'Data Center Architecture']
  }
];

const YourGuild: React.FC<{ guild: Guild }> = ({ guild }) => {
    const { leaveGuild } = useAppStore();
    return (
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 p-6 rounded-xl border border-purple-500/50 shadow-2xl space-y-6"
        >
            <div>
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-purple-300">{guild.name}</h2>
                    <Button variant="destructive" size="sm" onClick={() => {
                        if (window.confirm(`Are you sure you want to leave ${guild.name}?`)) {
                            leaveGuild();
                        }
                    }}>Leave Guild</Button>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold uppercase text-slate-400 mb-2">Members ({guild.members.length})</h3>
                <div className="flex flex-wrap gap-2">
                    {guild.members.map(member => (
                        <div key={member.id} className="flex items-center gap-2 bg-slate-700 p-1 pr-3 rounded-full" title={member.name}>
                             <img src={member.profileImageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${member.name}`} alt={member.name} className="w-6 h-6 rounded-full" />
                             <span className="text-sm font-medium text-slate-200">{member.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold uppercase text-slate-400 mb-2">Active Project</h3>
                {guild.activeProject ? (
                     <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                        <h4 className="font-semibold text-sky-300">{guild.activeProject.title}</h4>
                        <p className="text-sm text-slate-300">{guild.activeProject.description}</p>
                    </div>
                ): (
                    <p className="text-sm text-slate-500 italic">No active project. Awaiting assignment from the Foundation.</p>
                )}
            </div>
        </MotionDiv>
    );
};

const JoinGuilds: React.FC<{ guilds: Guild[] }> = ({ guilds }) => {
    const { joinGuild, currentUser } = useAppStore();
    return (
        <div className="space-y-4">
            {guilds
                .filter(g => !g.members.some(m => m.id === currentUser?.id))
                .map(guild => (
                <div key={guild.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-slate-100">{guild.name}</h4>
                        <p className="text-xs text-slate-400">{guild.members.length} member(s)</p>
                    </div>
                    <Button size="sm" onClick={() => joinGuild(guild.id)}>Join</Button>
                </div>
            ))}
        </div>
    );
};

const CreateGuild: React.FC = () => {
    const [name, setName] = useState('');
    const { createGuild } = useAppStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        createGuild(name.trim());
        setName('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-2">
            <h3 className="font-semibold text-slate-100">Create Your Own Guild</h3>
            <div className="flex gap-2">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Guild Name" required/>
                <Button type="submit">Create</Button>
            </div>
        </form>
    );
};


const ProjectBountyCard: React.FC<{ project: BrahmanTierProject }> = ({ project }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-3">
        <h3 className="text-xl font-bold text-amber-300">{project.title}</h3>
        <p className="text-sm text-slate-300">{project.description}</p>
        <div>
            <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map(skill => (
                    <span key={skill} className="px-2 py-1 text-xs bg-slate-700 rounded-md">{skill}</span>
                ))}
            </div>
        </div>
        <button disabled className="w-full mt-4 p-2 font-semibold bg-slate-600 rounded-md text-slate-400 cursor-not-allowed">
            Form a Guild & Bid (Coming Soon)
        </button>
    </div>
);


export const GuildsView: React.FC = () => {
    const { guilds, myGuild, fetchGuilds, fetchMyGuild, globalLoadingMessage } = useAppStore();
    const [isLoading, setIsLoading] = useState(true);
    const isLoadingAction = !!globalLoadingMessage?.includes('guild');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchGuilds(), fetchMyGuild()]);
            setIsLoading(false);
        };
        loadData();
    }, [fetchGuilds, fetchMyGuild]);

    return (
        <div className="flex-grow animated-gradient-bg-studio py-16 md:py-24">
            <MotionDiv
                className="container mx-auto px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white text-shadow-custom">Architects' Guilds</h1>
                    <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">Where elite architects collaborate on Brahman-tier projects that redefine the future.</p>
                </header>
                
                {isLoading ? (
                    <div className="flex justify-center"><LoadingSpinner /></div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        <section className="space-y-8">
                             {myGuild ? (
                                <YourGuild guild={myGuild} />
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-white">Join a Guild</h2>
                                    <JoinGuilds guilds={guilds} />
                                    <h2 className="text-2xl font-bold text-white mt-8">Or</h2>
                                    <CreateGuild />
                                </>
                            )}
                             {isLoadingAction && <div className="flex justify-center p-4"><LoadingSpinner/></div>}
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Available Brahman-Tier Projects</h2>
                            <div className="space-y-6">
                                {mockAvailableProjects.map(project => (
                                    <ProjectBountyCard key={project.id} project={project} />
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </MotionDiv>
        </div>
    );
};

export default GuildsView;