// src/components/common/NotificationContainer.tsx
import React from 'react';
import { useNotificationStore } from '../../state/notificationStore';
import type { Notification } from '../../types/index';

const iconMap = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )
};

const colorMap = {
  success: 'bg-emerald-800/80 border-emerald-600',
  error: 'bg-red-800/80 border-red-600',
  info: 'bg-sky-800/80 border-sky-600'
}

const NotificationToast: React.FC<{ notification: Notification; onDismiss: (id: number) => void }> = ({ notification, onDismiss }) => {
  return (
    <div className={`flex items-start p-4 mb-3 rounded-lg shadow-lg text-white border-l-4 ${colorMap[notification.type]} backdrop-blur-md animate-fade-in-right`}>
      <div className="flex-shrink-0">{iconMap[notification.type]}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-slate-100">{notification.message}</p>
      </div>
      <button onClick={() => onDismiss(notification.id)} className="ml-4 flex-shrink-0 text-slate-400 hover:text-white transition-colors">
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-24 right-4 w-full max-w-sm z-[200]">
      {notifications.map(n => (
        <NotificationToast key={n.id} notification={n} onDismiss={removeNotification} />
      ))}
    </div>
  );
};