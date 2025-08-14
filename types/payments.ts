// src/types/payments.ts
import type { User } from './user';
import type { ProjectSummary } from './project';
import type { BoqItem } from './api';


// =================================================================
// --- PAYMENTS & WALLET ---
// =================================================================
export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  tier: 'explorer' | 'architect' | 'firm';
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes: {
    userId: string;
    creditPackId: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  type: 'credit_purchase' | 'ai_tool_usage' | 'marketplace_sale' | 'marketplace_purchase' | 'payout' | 'adjustment';
  amount: number;
  description: string;
  relatedId?: string;
  createdAt: string;
}

export interface Supplier {
  _id: string;
  name: string;
  materialCategory: string;
  locationName: string;
  rating: number;
}
export interface Quote {
    _id: string;
    projectId: string | { _id: string, name: string };
    supplierId: string | { _id: string, name: string };
    materialName: string;
    quantity: number;
    unit: string;
    price: number;
    status: 'pending' | 'accepted' | 'rejected';
}
// NEW: Request for Quote type for Astra Network
export interface Rfq {
    _id: string;
    projectId: ProjectSummary;
    architectId: User;
    items: BoqItem[];
    status: 'open' | 'closed';
    createdAt: string;
}