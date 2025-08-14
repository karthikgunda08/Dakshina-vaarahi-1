// src/middleware/validation/foundationValidation.js
import { body } from 'express-validator';

export const createSubmissionValidation = [
  body('projectId')
    .isMongoId()
    .withMessage('A valid project ID must be selected.'),
  
  body('proposal')
    .notEmpty()
    .withMessage('Proposal message cannot be empty.')
    .trim()
    .isLength({ min: 50, max: 10000 })
    .withMessage('Proposal must be between 50 and 10000 characters.'),
];
