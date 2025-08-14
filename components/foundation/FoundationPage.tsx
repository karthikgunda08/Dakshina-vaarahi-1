// src/components/foundation/FoundationPage.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../state/appStore';
import * as projectService from '../../services/projectService';
import * as foundationService from '../../services/foundationService';
import { ProjectSummary } from '../../types/index';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNotificationStore } from '../../state/notificationStore';

const FoundationPage: React.FC = () => {
  const { currentUser } = useAppStore();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [proposal, setProposal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    let isMounted = true;
    if (currentUser) {
      projectService.loadUserProjects().then(data => {
        if (isMounted) setProjects(data);
      });
    }
    return () => { isMounted = false; };
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProject || !proposal) {
          addNotification("Please select a project and write a proposal.", "error");
          return;
      }
      setIsLoading(true);
      try {
        const response = await foundationService.submitToVaarahiPrize(selectedProject, proposal);
        addNotification(response.message, "success");
        setProposal('');
        setSelectedProject('');
      } catch (error: any) {
        addNotification(error.message, "error");
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="flex-grow bg-slate-900 text-slate-200">
      <header className="relative py-24 md:py-32 text-center text-white bg-gradient-to-br from-slate-900 via-brand-purple to-brand-indigo">
        <div className="absolute inset-0 opacity-20 bg-[url('/public/images/social-share.png')] bg-cover bg-center"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-shadow-custom">The AuraOS Foundation</h1>
          <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            Building the Future of Architecture, Together.
          </p>
          <p className="mt-8 text-xl md:text-2xl font-semibold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-400 text-shadow-custom">
            Our Revolt Never Stops
          </p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16 space-y-20">
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-amber-300 mb-4">Our Mission</h2>
          <p className="text-lg text-slate-300">
            The AuraOS Foundation is dedicated to identifying and nurturing the next generation of architectural visionaries. We believe in the power of design to create a more sustainable, harmonious, and beautiful world. We use our own AI platform to discover and support projects that exemplify innovation, sustainability, and divine intelligence.
          </p>
        </section>

        <section className="bg-slate-800/50 p-8 rounded-2xl border border-amber-500/50 shadow-2xl">
          <h2 className="text-3xl font-bold text-amber-300 mb-6 text-center">The Vaarahi Prize</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="prose prose-invert text-slate-300">
                <p>An annual award recognizing the most outstanding project designed on the AuraOS platform.</p>
                <h4>Prizes Include:</h4>
                <ul>
                    <li>A significant financial grant to help bring the project to life.</li>
                    <li>A lifetime supply of AI credits on the platform.</li>
                    <li>Mentorship from industry leaders.</li>
                    <li>A feature in our global Aura Showcase.</li>
                </ul>
                <h4>Judging Criteria:</h4>
                <p>Submissions are judged by our advanced AI on:</p>
                <ul>
                    <li><strong>Innovation & Creativity:</strong> Originality of the design concept.</li>
                    <li><strong>Vastu Compliance:</strong> Harmonious and energetic balance.</li>
                    <li><strong>Sustainability:</strong> Eco-friendly materials and design choices.</li>
                    <li><strong>Structural Soundness:</strong> Feasibility and intelligence of the structural plan.</li>
                </ul>
            </div>

            {currentUser ? (
              <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Submit Your Project</h3>
                  <div className="space-y-4">
                      <div>
                          <label htmlFor="project" className="block text-sm font-medium mb-1">Select a Project</label>
                          <select id="project" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="w-full p-2 bg-slate-700 rounded-md border border-slate-600">
                              <option value="">-- Choose your best work --</option>
                              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                      </div>
                      <div>
                          <label htmlFor="proposal" className="block text-sm font-medium mb-1">Your Proposal</label>
                          <textarea id="proposal" value={proposal} onChange={e => setProposal(e.target.value)} rows={5} className="w-full p-2 bg-slate-700 rounded-md border border-slate-600" placeholder="Explain why your project deserves to win. What makes it special?"></textarea>
                      </div>
                      <button type="submit" disabled={isLoading} className="w-full p-3 font-semibold bg-amber-600 hover:bg-amber-500 rounded-md disabled:opacity-50 flex justify-center">
                          {isLoading ? <LoadingSpinner size="h-5 w-5"/> : "Submit for The Vaarahi Prize"}
                      </button>
                  </div>
              </form>
            ) : (
                <div className="text-center p-8 bg-slate-900 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Ready to change the world?</h3>
                    <p className="text-slate-400 mb-4">Log in or sign up to submit your masterpiece.</p>
                    <a href="/" className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-md font-bold">Get Started</a>
                </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default FoundationPage;