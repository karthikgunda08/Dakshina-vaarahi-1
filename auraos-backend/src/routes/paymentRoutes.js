
// src/routes/paymentRoutes.js
import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// This route is protected, only logged-in users can create payment orders for credits.
router.post('/create-credit-order', authMiddleware, paymentController.createCreditOrder);

// This is a public webhook route that Razorpay will call. 
// Security is handled by verifying the signature inside the controller.
router.post('/verify-credit-payment', paymentController.verifyCreditPayment);

export default router;
