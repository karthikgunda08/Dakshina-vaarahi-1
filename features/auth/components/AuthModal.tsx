// src/features/auth/components/AuthModal.tsx
import React, { useState } from 'react';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../../../components/ui/Modal';
import { useAppStore } from '../../../state/appStore';
import { DakshinVaarahiLogo } from '../../../components/icons/DakshinVaarahiLogo';

const AuthModal: React.FC = () => {
  const { authModal, globalLoadingMessage, authError, setAuthModal, login, register, forgotPassword } = useAppStore(state => ({
    authModal: state.authModal,
    globalLoadingMessage: state.globalLoadingMessage,
    authError: state.authError,
    setAuthModal: state.setAuthModal,
    login: state.login,
    register: state.register,
    forgotPassword: state.forgotPassword,
  }));
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Internal mode for switching between views without affecting the global state directly until needed
  const [currentMode, setCurrentMode] = useState<'login' | 'register' | 'forgotPassword' | null>(authModal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (currentMode === 'register' && password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }
    if (currentMode === 'login') {
        login(email, password);
    }
    if (currentMode === 'register') {
        register(email, password, phoneNumber, whatsappOptIn);
    }
    if (currentMode === 'forgotPassword') {
        forgotPassword(email);
    }
  };

  const isLoading = globalLoadingMessage !== null;
  const error = authError || validationError;
  
  const handleClose = () => setAuthModal(null);

  const renderModalContent = () => {
    switch(currentMode) {
      case 'login':
        return (
          <>
            <ModalHeader>
                <DakshinVaarahiLogo className="w-16 h-auto mx-auto" />
                <ModalTitle>Welcome Back</ModalTitle>
            </ModalHeader>
            <ModalContent>
                {error && <div className="mb-4 p-3 bg-destructive/20 text-destructive-foreground rounded-md text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="email-login">Email</Label>
                        <Input id="email-login" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="password-login">Password</Label>
                        <Input id="password-login" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? <LoadingSpinner size="h-5 w-5" /> : 'Login'}</Button>
                </form>
            </ModalContent>
            <ModalFooter className="flex-col !items-start">
                <Button variant="link" size="sm" onClick={() => setCurrentMode('forgotPassword')}>Forgot Password?</Button>
                <p className="text-xs text-muted-foreground">Don't have an account? <Button variant="link" size="sm" onClick={() => setCurrentMode('register')}>Sign Up</Button></p>
            </ModalFooter>
          </>
        );
      case 'register':
        return (
          <>
            <ModalHeader>
                <DakshinVaarahiLogo className="w-16 h-auto mx-auto" />
                <ModalTitle>Create Your Account</ModalTitle>
            </ModalHeader>
            <ModalContent>
                 {error && <div className="mb-4 p-3 bg-destructive/20 text-destructive-foreground rounded-md text-sm">{error}</div>}
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="email-register">Email</Label>
                        <Input id="email-register" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="phone-register">Phone Number</Label>
                        <Input id="phone-register" type="tel" placeholder="+91..." value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="password-register">Password</Label>
                        <Input id="password-register" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="confirm-password-register">Confirm Password</Label>
                        <Input id="confirm-password-register" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="whatsappOptIn" checked={whatsappOptIn} onChange={e => setWhatsappOptIn(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      <Label htmlFor="whatsappOptIn" className="text-xs">Receive occasional project suggestions on WhatsApp.</Label>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? <LoadingSpinner size="h-5 w-5" /> : 'Create Account'}</Button>
                </form>
            </ModalContent>
             <ModalFooter>
                <p className="text-xs text-muted-foreground">Already have an account? <Button variant="link" size="sm" onClick={() => setCurrentMode('login')}>Login</Button></p>
            </ModalFooter>
          </>
        );
      case 'forgotPassword':
        return (
          <>
            <ModalHeader>
                <DakshinVaarahiLogo className="w-16 h-auto mx-auto" />
                <ModalTitle>Reset Your Password</ModalTitle>
            </ModalHeader>
            <ModalContent>
                <p className="text-sm text-muted-foreground mb-4">Enter your email and we'll send you a reset link.</p>
                 {error && <div className="mb-4 p-3 bg-destructive/20 text-destructive-foreground rounded-md text-sm">{error}</div>}
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="email-forgot">Email</Label>
                        <Input id="email-forgot" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? <LoadingSpinner size="h-5 w-5" /> : 'Send Reset Link'}</Button>
                </form>
            </ModalContent>
             <ModalFooter>
                <Button variant="link" size="sm" onClick={() => setCurrentMode('login')}>Back to Login</Button>
            </ModalFooter>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal onClose={handleClose}>
        {renderModalContent()}
    </Modal>
  );
};

export default AuthModal;
