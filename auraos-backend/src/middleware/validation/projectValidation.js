// src/middleware/validation/projectValidation.js
import { body } from 'express-validator';

export const createOrUpdateProjectValidation = [
  body('name')
    .notEmpty()
    .withMessage('Project name is required.')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Project name must be between 3 and 100 characters.'),
  
  body('projectType')
    .isIn(['building', 'masterPlan'])
    .withMessage('Invalid project type.'),
];

export const updateProjectNameValidation = [
  body('name')
    .notEmpty()
    .withMessage('Project name is required.')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Project name must be between 3 and 100 characters.'),
];

export const inviteCollaboratorValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email to invite.')
    .normalizeEmail(),
];

export const publishProjectValidation = [
    body('price')
        .isNumeric({ min: 10 })
        .withMessage('Price must be at least 10 credits.'),
    body('description')
        .notEmpty()
        .withMessage('A description is required to publish.')
        .trim()
        .isLength({ min: 20, max: 1000 })
        .withMessage('Description must be between 20 and 1000 characters.'),
];

export const tokenizeProjectValidation = [
    body('totalTokens')
        .isInt({ min: 1 })
        .withMessage('Total tokens must be a positive number.'),
    body('pricePerToken')
        .isNumeric({ min: 1 })
        .withMessage('Price per token must be at least 1 credit.'),
    body('offeringDescription')
        .notEmpty()
        .withMessage('An offering description is required.')
        .trim()
        .isLength({ min: 20, max: 2000 })
        .withMessage('Description must be between 20 and 2000 characters.'),
];
