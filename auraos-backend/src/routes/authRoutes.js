// src/routes/authRoutes.js
import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { registerValidation } from '../middleware/validation/authValidation.js';
import { handleValidation } from '../middleware/validation/handleValidation.js';
const router = express.Router();

router.post('/register', registerValidation, handleValidation, authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getProfile);

// Routes for user profile management
router.put('/me', authMiddleware, authController.updateProfile);
router.post('/me/change-password', authMiddleware, authController.changePassword);

// Password Reset Routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Route for user dashboard analytics
router.get('/me/analytics', authMiddleware, authController.getUserAnalytics);

// NEW: Route for API Key Management
router.post('/me/api-key', authMiddleware, authController.generateApiKey);

// NEW: Routes for workspace management
router.get('/me/workspaces', authMiddleware, authController.getWorkspaces);
router.post('/me/workspaces', authMiddleware, authController.saveWorkspace);
router.delete('/me/workspaces/:workspaceId', authMiddleware, authController.deleteWorkspace);


export default router;
