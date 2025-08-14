
// services/paymentService.ts
import type { User, RazorpayOptions, RazorpayPaymentResponse, CreditPack } from '../types/index';
import { 
    RAZORPAY_KEY_ID, 
    CURRENCY,
    APP_TITLE,
    BACKEND_API_BASE_URL
} from '../lib/constants';
import { getToken } from './authService';

interface InitiateCreditPurchaseParams {
  currentUser: User;
  creditPack: CreditPack;
  onPaymentSuccess: (response: RazorpayPaymentResponse) => void;
  onPaymentError: (error: any) => void;
  onModalDismiss?: () => void;
}

const createCreditOrderApi = async (creditPackId: string, amountInRupees: number, currency: string) => {
  const token = getToken();
  const response = await fetch(`${BACKEND_API_BASE_URL}/payments/create-credit-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ creditPackId, amount: amountInRupees, currency }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create payment order.');
  }
  return response.json();
};


export const initiateCreditPurchase = async ({
  currentUser,
  creditPack,
  onPaymentSuccess,
  onPaymentError,
  onModalDismiss,
}: InitiateCreditPurchaseParams): Promise<void> => {
  if (!(window as any).Razorpay) {
    console.error('Razorpay SDK not loaded. Please check your internet connection or refresh the page.');
    onPaymentError(new Error('Razorpay SDK not loaded.'));
    return;
  }

  try {
    const orderData = await createCreditOrderApi(creditPack.id, creditPack.price, CURRENCY);

    if (!orderData || !orderData.id) {
        throw new Error('Invalid order response from server.');
    }

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: orderData.amount, // Amount in paise from server
      currency: orderData.currency,
      name: APP_TITLE,
      description: `Purchase of ${creditPack.name} (${creditPack.credits} credits)`,
      order_id: orderData.id,
      handler: (response: RazorpayPaymentResponse) => {
        // The webhook on the backend will handle verification and crediting the user.
        // We can optimistically consider this a success on the frontend.
        onPaymentSuccess(response);
      },
      prefill: {
        name: currentUser.name || currentUser.email.split('@')[0] || "Dakshin Vaarahi User",
        email: currentUser.email,
      },
      notes: {
        userId: currentUser.id,
        creditPackId: creditPack.id,
      },
      theme: {
        color: "#4C1D95"
      },
      modal: {
        ondismiss: () => {
          if (onModalDismiss) onModalDismiss();
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
        console.error('Razorpay Payment Failed:', response.error);
        onPaymentError(response.error);
    });
    rzp.open();

  } catch (error) {
    console.error("Error initiating Razorpay payment:", error);
    onPaymentError(error);
  }
};