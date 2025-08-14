// src/middleware/validation/feedbackValidation.js
import { body } from 'express-validator';

export const createFeedbackValidation = [
  body('category')
    .isIn(['bug_report', 'feature_request', 'general_feedback'])
    .withMessage('Invalid feedback category.'),
  
  body('message')
    .notEmpty()
    .withMessage('Feedback message cannot be empty.')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters.'),
];
