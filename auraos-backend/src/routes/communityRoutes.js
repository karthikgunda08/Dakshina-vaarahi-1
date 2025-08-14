
// src/routes/communityRoutes.js
import express from 'express';
import * as communityController from '../controllers/communityController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC COMMUNITY ROUTES (NO AUTH) ---

// Get all projects marked as public for the main showcase gallery
router.get('/projects', communityController.getPublicProjects);

// Get a specific user's public profile details
router.get('/users/:userId', communityController.getPublicUserProfile);

// NEW: Get the single featured project for the dashboard showcase
router.get('/featured-project', communityController.getFeaturedProject);


// The authenticated route to toggle a project's public status is defined in projectRoutes.js
// This prevents duplication and resolves the startup error.
// The correct endpoint is: PUT /api/projects/:projectId/toggle-public

export default router;
