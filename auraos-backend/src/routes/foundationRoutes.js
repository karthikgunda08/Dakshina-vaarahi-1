// src/routes/foundationRoutes.js
import express from 'express';
import * as foundationController from '../controllers/foundationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerMiddleware from '../middleware/ownerMiddleware.js';
import { createSubmissionValidation } from '../middleware/validation/foundationValidation.js';
import { handleValidation } from '../middleware/validation/handleValidation.js';

const router = express.Router();

// Authenticated user can submit a project
router.post('/submit', authMiddleware, createSubmissionValidation, handleValidation, foundationController.createSubmission);

// Owner can view all submissions
router.get('/submissions', authMiddleware, ownerMiddleware, foundationController.getSubmissions);

// Owner can trigger adjudication for a submission
router.post('/submissions/:submissionId/adjudicate', authMiddleware, ownerMiddleware, foundationController.adjudicateSubmission);

export default router;