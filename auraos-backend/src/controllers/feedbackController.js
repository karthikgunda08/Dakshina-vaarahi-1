
// src/controllers/feedbackController.js
import Feedback from '../models/Feedback.js';

export const createFeedback = async (req, res, next) => {
    const { userId } = req.user;
    const { category, message } = req.body;

    if (!category || !message) {
        return res.status(400).json({ message: 'Category and message are required.' });
    }
    
    try {
        const newFeedback = new Feedback({
            userId,
            category,
            message
        });
        
        await newFeedback.save();
        
        res.status(201).json({ message: 'Thank you for your feedback!' });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};
