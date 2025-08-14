// src/routes/adminRoutes.js
import express from 'express';
import * as adminController from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerMiddleware from '../middleware/ownerMiddleware.js';

const router = express.Router();

// All routes in this file are protected and require owner access
router.use(authMiddleware);
router.use(ownerMiddleware);

router.get('/kpis', adminController.getKpiData);
router.get('/kpi-chart-data', adminController.getKpiChartData); // NEW
router.get('/all-projects', adminController.getAllProjectsForOwner);
router.get('/all-users', adminController.getAllUsersForOwner);
router.get('/all-feedback', adminController.getAllFeedback);

// NEW: Route for Brahman Protocol Insights
router.get('/strategic-insights', adminController.getStrategicInsights);


export default router;