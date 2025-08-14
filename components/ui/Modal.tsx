import React from 'react';
import { cn } from '../../lib/utils';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ children, onClose, className }) => {
  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn("bg-card border shadow-lg w-full max-w-lg m-4 rounded-xl flex flex-col max-h-[90vh]", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};


export const ModalHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left p-6", className)}>
        {children}
    </div>
);

export const ModalTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight text-card-foreground", className)}>
        {children}
    </h2>
);

export const ModalDescription: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <p className={cn("text-sm text-muted-foreground", className)}>
        {children}
    </p>
);

export const ModalContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={cn("p-6 pt-0 flex-auto overflow-y-auto", className)}>
        {children}
    </div>
);


export const ModalFooter: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0", className)}>
        {children}
    </div>
);