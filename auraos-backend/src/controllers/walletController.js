
// src/controllers/walletController.js
import Transaction from '../models/Transaction.js';

export const getTransactions = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;
        const skip = (page - 1) * limit;

        const totalTransactions = await Transaction.countDocuments({ userId });
        const transactions = await Transaction.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        res.json({
            transactions: transactions.map(t => t.toObject()),
            totalPages: Math.ceil(totalTransactions / limit),
            currentPage: page
        });
    } catch (error) {
        next(error);
    }
};
