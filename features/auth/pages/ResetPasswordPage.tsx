// src/features/auth/pages/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { useAppStore } from '../../../state/appStore';
import * as authService from '../../../services/authService';
import { useNotificationStore } from '../../../state/notificationStore';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { DakshinVaarahiLogo } from '../../../components/icons/DakshinVaarahiLogo';

interface ResetPasswordPageProps {
  token: string;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ token }) => {
    const { setView } = useAppStore();
    const { addNotification } = useNotificationStore();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await authService.resetPassword(token, password);
            addNotification('Password reset successfully! Please log in.', 'success');
            setView('landing'); // Redirect to landing to show login modal
            useAppStore.getState().setAuthModal('login');
        } catch (err: any) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center animated-gradient-bg">
            <div className="max-w-md w-full p-8 bg-card rounded-xl shadow-2xl border border-border">
                <DakshinVaarahiLogo className="w-16 h-auto mx-auto mb-4"/>
                <h2 className="text-2xl font-bold text-center text-card-foreground">Set New Password</h2>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && <p className="text-sm text-center text-destructive">{error}</p>}
                    <div className="space-y-1">
                        <Label htmlFor="password">New Password</Label>
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <LoadingSpinner size="h-5 w-5 mr-2" />}
                        Reset Password
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;