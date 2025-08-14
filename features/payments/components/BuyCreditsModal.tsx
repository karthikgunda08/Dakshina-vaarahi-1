// src/features/payments/components/BuyCreditsModal.tsx
import React from 'react';
import { useAppStore } from '../../../state/appStore';
import { useNotificationStore } from '../../../state/notificationStore';
import { initiateCreditPurchase } from '../../../services/paymentService';
import type { CreditPack } from '../../../types/index';
import { CREDIT_PACKS } from '../../../lib/constants';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PackCard: React.FC<{
  pack: CreditPack;
  onSelect: () => void;
  isLoading: boolean;
}> = ({ pack, onSelect, isLoading }) => (
  <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
    <h3 className="font-bold text-lg text-primary">{pack.credits.toLocaleString()} <span className="text-sm font-normal text-slate-300">Credits</span></h3>
    <p className="text-sm text-slate-400 mt-1">{pack.description}</p>
    <div className="mt-3 flex justify-between items-center">
      <p className="text-xl font-semibold text-white">₹{pack.price.toLocaleString('en-IN')}</p>
      <Button onClick={onSelect} disabled={isLoading}>
        Buy Now
      </Button>
    </div>
  </div>
);

const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAppStore();
  const { addNotification } = useNotificationStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePayment = async (pack: CreditPack) => {
    if (!currentUser) {
      addNotification('You must be logged in to buy credits.', 'error');
      return;
    }
    setIsLoading(true);
    await initiateCreditPurchase({
      currentUser,
      creditPack: pack,
      onPaymentSuccess: () => {
        addNotification('Payment successful! Your credits will be updated shortly.', 'success');
        setIsLoading(false);
        onClose();
        // The user's credits are updated via webhook, but we can optimistically refresh
        setTimeout(() => useAppStore.getState().refreshCurrentUser(), 2000);
      },
      onPaymentError: (error) => {
        addNotification(`Payment failed: ${error.message || 'An unknown error occurred.'}`, 'error');
        setIsLoading(false);
      },
      onModalDismiss: () => {
        addNotification('Payment was cancelled.', 'info');
        setIsLoading(false);
      },
    });
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Buy AI Credits</ModalTitle>
        <p className="text-sm text-muted-foreground">Choose a credit pack to fuel your architectural creations.</p>
      </ModalHeader>
      <ModalContent className="space-y-4">
        {isLoading && (
            <div className="absolute inset-0 bg-card/80 flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="mt-2 text-sm">Redirecting to payment gateway...</p>
            </div>
        )}
        {CREDIT_PACKS.map(pack => (
          <PackCard key={pack.id} pack={pack} onSelect={() => handlePayment(pack)} isLoading={isLoading} />
        ))}
      </ModalContent>
    </Modal>
  );
};

export default BuyCreditsModal;