// src/components/collaboration/PresenceAvatars.tsx
import React from 'react';
import { Collaborator, User } from '../../types/index';

interface PresenceAvatarsProps {
  collaborators: Collaborator[];
  ownerId: string;
  currentUser: User | null;
}

const Avatar: React.FC<{ user: { name?: string, email: string, profileImageUrl?: string } }> = ({ user }) => (
  <img
    src={user.profileImageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${user.name || user.email}`}
    alt={user.name || user.email}
    title={`${user.name || user.email}`}
    className="w-8 h-8 rounded-full border-2 border-slate-900 -ml-2 transition-transform hover:scale-110"
  />
);

const PresenceAvatars: React.FC<PresenceAvatarsProps> = ({ collaborators, currentUser }) => {
  if (!currentUser) return null;

  // Filter out the current user from the list to avoid showing their own avatar.
  const otherCollaborators = collaborators.filter(c => c.userId?.id !== currentUser.id);

  return (
    <div className="flex items-center p-1 bg-slate-800/50 backdrop-blur-md rounded-full">
      {/* Current User always first */}
      <Avatar user={currentUser} />
      
      {/* Other collaborators */}
      {otherCollaborators.map(({ userId }) => (
        userId ? <Avatar key={userId.id} user={userId} /> : null
      ))}
    </div>
  );
};

export default PresenceAvatars;