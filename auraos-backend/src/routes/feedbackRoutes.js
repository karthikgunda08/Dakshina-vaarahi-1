// src/routes/feedbackRoutes.js
import express from 'express';
import * as feedbackController from '../controllers/feedbackController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { createFeedbackValidation } from '../middleware/validation/feedbackValidation.js';
import { handleValidation } from '../middleware/validation/handleValidation.js';

const router = express.Router();

// All feedback routes require a logged-in user
router.post('/', authMiddleware, createFeedbackValidation, handleValidation, feedbackController.createFeedback);

export default router;