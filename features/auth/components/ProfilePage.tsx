// src/features/auth/components/ProfilePage.tsx
import React, { useState } from 'react';
import type { User, UpdateUserPayload, ChangePasswordPayload } from '../../../types/index';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useNotificationStore } from '../../../state/notificationStore';
import * as authService from '../../../services/authService';
import { useAppStore } from '../../../state/appStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';

// --- Tab Components ---

const ProfileDetailsTab: React.FC<{ user: User, onUpdate: () => void }> = ({ user, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        profession: user.profession || '',
        bio: user.bio || '',
        phoneNumber: user.phoneNumber || '',
        whatsappOptIn: user.whatsappOptIn || false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotificationStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authService.updateUserProfile(formData);
            addNotification('Profile updated successfully!', 'success');
            onUpdate();
        } catch (error: any) {
            addNotification(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-100">Profile Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="profession">Profession</Label>
                    <Input id="profession" name="profession" value={formData.profession} onChange={handleChange} placeholder="e.g., Architect, Designer" />
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="bio">Bio</Label>
                <textarea id="bio" name="bio" rows={3} value={formData.bio} onChange={handleChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-sm" placeholder="Tell us a little about yourself..."/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+91..." />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                    <input type="checkbox" id="whatsappOptIn" name="whatsappOptIn" checked={formData.whatsappOptIn} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <Label htmlFor="whatsappOptIn">Receive WhatsApp updates</Label>
                </div>
            </div>
            <div className="text-right">
                <Button type="submit" disabled={isLoading}>{isLoading && <LoadingSpinner size="h-4 w-4 mr-2" />} Save Changes</Button>
            </div>
        </form>
    );
};

const PublicProfileTab: React.FC<{ user: User, onUpdate: () => void }> = ({ user, onUpdate }) => {
    const [formData, setFormData] = useState({
        isProfilePublic: user.isProfilePublic || false,
        portfolioUrl: user.portfolioUrl || '',
        linkedInUrl: user.linkedInUrl || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotificationStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authService.updateUserProfile(formData);
            addNotification('Public profile settings updated!', 'success');
            onUpdate();
        } catch (error: any) {
            addNotification(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-100">Public Showcase Profile</h3>
            <div className="p-4 bg-slate-700/50 rounded-lg">
                 <div className="flex items-center justify-between">
                    <Label htmlFor="isProfilePublic" className="font-semibold text-slate-200">Make my profile public</Label>
                    <input type="checkbox" id="isProfilePublic" name="isProfilePublic" checked={formData.isProfilePublic} onChange={handleChange} className="h-5 w-5 rounded text-primary bg-slate-600 border-slate-500 focus:ring-primary"/>
                </div>
                <p className="text-xs text-slate-400 mt-1">Allows other users to see your name, bio, and public projects in the Community Showcase.</p>
            </div>
            <div className="space-y-1">
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input id="portfolioUrl" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://your-portfolio.com"/>
            </div>
            <div className="space-y-1">
                <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                <Input id="linkedInUrl" name="linkedInUrl" value={formData.linkedInUrl} onChange={handleChange} placeholder="https://linkedin.com/in/your-profile"/>
            </div>
            <div className="text-right">
                <Button type="submit" disabled={isLoading}>{isLoading && <LoadingSpinner size="h-4 w-4 mr-2" />} Save Settings</Button>
            </div>
        </form>
    );
};

const SecurityTab: React.FC = () => {
    const [passwords, setPasswords] = useState<ChangePasswordPayload>({ currentPassword: '', newPassword: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addNotification } = useNotificationStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await authService.changeUserPassword(passwords);
            addNotification("Password changed successfully!", "success");
            setPasswords({ currentPassword: '', newPassword: '' });
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-100">Change Password</h3>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="space-y-1">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({...p, currentPassword: e.target.value}))} required />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({...p, newPassword: e.target.value}))} required minLength={6} />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <Input id="confirmNewPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
                <div className="text-right">
                    <Button type="submit" disabled={isLoading}>{isLoading && <LoadingSpinner size="h-4 w-4 mr-2" />} Update Password</Button>
                </div>
            </form>

            <div className="border-t border-red-500/30 pt-6">
                 <h3 className="text-xl font-semibold text-red-400">Danger Zone</h3>
                 <div className="mt-4 p-4 border border-red-500/50 bg-red-900/20 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-slate-200">Delete Account</p>
                        <p className="text-sm text-slate-400">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <Button variant="destructive" onClick={() => alert("Account deletion is a critical operation. This button is a placeholder.")}>Delete My Account</Button>
                 </div>
            </div>
         </div>
    );
};

const ProfilePage: React.FC = () => {
  const { 
    currentUser, 
    setProfilePageOpen, 
    setBuyCreditsModalOpen,
    refreshCurrentUser,
  } = useAppStore(state => ({
    currentUser: state.currentUser,
    setProfilePageOpen: state.setProfilePageOpen,
    setBuyCreditsModalOpen: state.setBuyCreditsModalOpen,
    refreshCurrentUser: state.refreshCurrentUser,
  }));

  const [activeTab, setActiveTab] = useState<'profile' | 'public_profile' | 'security'>('profile');
  
  if (!currentUser) return null;

  const NavButton: React.FC<{ tabId: typeof activeTab, children: React.ReactNode }> = ({ tabId, children }) => (
      <button
          onClick={() => setActiveTab(tabId)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tabId ? 'bg-sky-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
      >
          {children}
      </button>
  );
  
  const renderContent = () => {
      switch(activeTab) {
          case 'profile': return <ProfileDetailsTab user={currentUser} onUpdate={refreshCurrentUser} />;
          case 'public_profile': return <PublicProfileTab user={currentUser} onUpdate={refreshCurrentUser} />;
          case 'security': return <SecurityTab />;
          default: return null;
      }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-[100]"
      onClick={() => setProfilePageOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div
        className="bg-slate-800 p-0 rounded-xl shadow-2xl w-full max-w-4xl m-4 h-[90vh] max-h-[800px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-700 flex-shrink-0">
          <h2 id="profile-modal-title" className="text-2xl font-bold text-sky-300">
            Account Settings
          </h2>
          <button onClick={() => setProfilePageOpen(false)} className="text-slate-400 hover:text-sky-300 transition-colors" aria-label="Close profile modal">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-grow overflow-hidden">
            <nav className="w-1/4 border-r border-slate-700 p-4 flex-shrink-0 flex flex-col gap-1">
                <NavButton tabId="profile">Profile</NavButton>
                <NavButton tabId="public_profile">Public Showcase</NavButton>
                <NavButton tabId="security">Security</NavButton>
                <div className="mt-auto pt-4 border-t border-slate-700">
                     <Button onClick={() => setBuyCreditsModalOpen(true)} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900">Buy Credits</Button>
                </div>
            </nav>
            <main className="flex-grow overflow-y-auto p-6 md:p-8">
                {renderContent()}
            </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
