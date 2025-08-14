
// src/routes/walletRoutes.js
import express from 'express';
import * as walletController from '../controllers/walletController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all transactions for the logged-in user
router.get('/transactions', authMiddleware, walletController.getTransactions);

export default router;
