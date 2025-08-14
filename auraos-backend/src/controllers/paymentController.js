
// src/controllers/paymentController.js
import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Transaction from '../models/Transaction.js'; // NEW
import AppError from '../utils/AppError.js';

// --- LAZY INITIALIZATION FOR RAZORPAY ---
// To ensure environment variables are loaded before the instance is created.
let rzpInstance = null;

const getRazorpayInstance = () => {
    if (!rzpInstance) {
        // The main check for these variables is in server.js,
        // this is an additional safeguard.
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("FATAL: Razorpay keys are not configured. The server should have exited on startup.");
            // This error will be caught by the global error handler.
            throw new AppError('Payment provider is not configured on the server.', 500);
        }
        rzpInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return rzpInstance;
};


export const createCreditOrder = async (req, res, next) => {
    try {
        const rzp = getRazorpayInstance(); // Get instance here
        const { amount, currency, creditPackId } = req.body;
        const { userId } = req.user;

        if (!amount || !currency || !creditPackId || typeof amount !== 'number' || amount <= 0) {
            return next(new AppError("Valid amount, currency, and credit pack ID are required.", 400));
        }

        const options = {
            amount: amount * 100, // Razorpay amount is in paise
            currency: currency,
            receipt: `receipt_order_${crypto.randomBytes(4).toString('hex')}`,
            notes: { userId, creditPackId }
        };

        const order = await rzp.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        // Pass to the global error handler
        if (!(error instanceof AppError)) {
            next(new AppError('Failed to create payment order with provider.', 502));
        } else {
            next(error);
        }
    }
};

export const verifyCreditPayment = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
        console.error("FATAL: Razorpay webhook secret not configured. Cannot verify payments.");
        return res.status(500).json({ status: 'error', message: 'Internal server configuration error for payments.' });
    }
    
    try {
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(req.body); // req.body is a buffer here because we used express.raw()
        const digest = shasum.digest('hex');

        if (digest !== req.headers['x-razorpay-signature']) {
            console.warn('Payment verification failed. Signature mismatch.');
            return res.status(400).json({ status: 'error', message: 'Invalid signature.' });
        }
        
        const event = JSON.parse(req.body.toString());
        
        if (event.event === 'payment.captured') {
            const paymentEntity = event.payload.payment.entity;
            
            const existingPayment = await Payment.findOne({ paymentId: paymentEntity.id });
            if (existingPayment) {
                console.log(`Webhook for paymentId ${paymentEntity.id} already processed.`);
                return res.status(200).json({ status: 'ok' });
            }

            const rzp = getRazorpayInstance(); // Get instance here
            const orderDetails = await rzp.orders.fetch(paymentEntity.order_id);
            const { userId, creditPackId } = orderDetails.notes;
            
            // This map MUST be kept in sync with the frontend `CREDIT_PACKS` constant
            const creditPacks = {
                'pack_explorer': 100,
                'pack_architect': 500,
                'pack_studio': 1200,
                'pack_enterprise': 3000,
            };
            const creditsToAdd = creditPacks[creditPackId];

            if (userId && creditsToAdd) {
                await User.findByIdAndUpdate(userId, { $inc: { credits: creditsToAdd } });
                
                await Payment.create({
                    userId,
                    orderId: paymentEntity.order_id,
                    paymentId: paymentEntity.id,
                    amount: paymentEntity.amount, // Amount is in paise
                    currency: paymentEntity.currency,
                    creditPackId,
                    status: paymentEntity.status,
                });
                
                // NEW: Log the transaction
                await Transaction.create({
                    userId,
                    type: 'credit_purchase',
                    amount: creditsToAdd,
                    description: `Purchased ${creditPackId}`,
                    relatedId: paymentEntity.id,
                });


                console.log(`Successfully credited ${creditsToAdd} credits to user ${userId}.`);
            }
        }
        
        res.status(200).json({ status: 'ok' });

    } catch (error) {
        console.error('Error in Razorpay webhook handler:', error);
        res.status(500).json({ status: 'error' });
    }
};
