
// src/routes/astraRoutes.js
import express from 'express';
import * as astraController from '../controllers/astraController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Find suppliers based on criteria
router.get('/suppliers', astraController.findSuppliers);

// Get quotes for a specific project
router.get('/projects/:projectId/quotes', astraController.getQuotesForProject);

// NEW: Create a Request for Quote for a project
router.post('/projects/:projectId/rfq', astraController.createRfqForProject);

// NEW: Get all quotes for the current user's projects
router.get('/quotes', astraController.getUserQuotes);

export default router;
