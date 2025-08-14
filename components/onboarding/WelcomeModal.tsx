// src/components/onboarding/WelcomeModal.tsx
import React, { useState } from 'react';
import { useAppStore } from '../../state/appStore';
import * as authService from '../../services/authService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { DakshinVaarahiLogo } from '../icons/DakshinVaarahiLogo';

const WelcomeModal: React.FC = () => {
    const { currentUser, refreshCurrentUser, startInteractiveTutorial, completeOnboardingChecklistItem, setWelcomeModalOpen } = useAppStore();
    const [name, setName] = useState(currentUser?.name || '');
    const [profession, setProfession] = useState(currentUser?.profession || '');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotificationStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authService.updateUserProfile({ name, profession });
            await refreshCurrentUser();
            addNotification('Profile updated successfully!', 'success');
            completeOnboardingChecklistItem('profileCompleted');
            setWelcomeModalOpen(false);
            // Directly trigger the first mission
            startInteractiveTutorial();
        } catch (error: any) {
            addNotification(`Update failed: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-lg z-[200] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl text-center">
                <DakshinVaarahiLogo className="w-24 h-24 mx-auto text-primary" />
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-4">Welcome to AuraOS</h1>
                <p className="text-lg text-slate-300 mt-2">The Operating System for Architecture.</p>
                <p className="text-slate-400 mt-6 max-w-xl mx-auto">
                    You've been granted <strong className="text-amber-300">100 complimentary AI Credits</strong> to explore the platform. Complete your first guided mission for a <strong className="text-amber-300">bonus of 25 credits!</strong> Let's get your profile set up.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto space-y-4 text-left">
                    <div>
                        <Label htmlFor="name">What should we call you?</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            className="mt-1"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="profession">What is your profession?</Label>
                        <Input
                            id="profession"
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            placeholder="e.g., Architect, Student, Designer"
                            className="mt-1"
                        />
                    </div>
                    <Button type="submit" size="lg" className="w-full mt-4" disabled={isLoading}>
                        {isLoading && <LoadingSpinner size="h-5 w-5 mr-2" />}
                        Start First Mission
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default WelcomeModal;