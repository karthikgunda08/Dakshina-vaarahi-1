// src/routes/projectRoutes.js
import express from 'express';
import multer from 'multer';
import * as projectController from '../controllers/projectController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Protect all project routes
import {
  createOrUpdateProjectValidation,
  updateProjectNameValidation,
  inviteCollaboratorValidation,
  publishProjectValidation,
  tokenizeProjectValidation,
} from '../middleware/validation/projectValidation.js';
import { handleValidation } from '../middleware/validation/handleValidation.js';

const router = express.Router();
const storage = multer.memoryStorage(); // Store the file in memory as a buffer
const upload = multer({ storage: storage });

// --- Core Project CRUD ---
router.post('/', authMiddleware, createOrUpdateProjectValidation, handleValidation, projectController.createOrUpdateProject);
router.get('/', authMiddleware, projectController.getUserProjects);
router.get('/:projectId', authMiddleware, projectController.getProjectById);
router.delete('/:projectId', authMiddleware, projectController.deleteProject);
router.put('/:projectId/name', authMiddleware, updateProjectNameValidation, handleValidation, projectController.updateProjectName);


// --- Analytics Route ---
router.get('/:projectId/analytics', authMiddleware, projectController.getProjectAnalytics);

// --- Collaborator Routes ---
router.get('/:projectId/collaborators', authMiddleware, projectController.getCollaborators);
router.post('/:projectId/collaborators', authMiddleware, inviteCollaboratorValidation, handleValidation, projectController.inviteCollaborator);
router.delete('/:projectId/collaborators/:collaboratorId', authMiddleware, projectController.removeCollaborator);


// --- Version History Routes ---
router.get('/:projectId/versions', authMiddleware, projectController.getProjectVersions);
router.post('/:projectId/versions/:versionId/restore', authMiddleware, projectController.restoreProjectVersion);

// --- Project Hub Asset Routes ---
router.post('/:projectId/documents', authMiddleware, projectController.addDocument);
router.delete('/:projectId/documents/:assetId', authMiddleware, projectController.deleteDocument);
router.post('/:projectId/renders', authMiddleware, projectController.addRender);
router.delete('/:projectId/renders/:assetId', authMiddleware, projectController.deleteRender);

// --- DWG/DXF Interoperability ---
router.post('/import-dwg', authMiddleware, upload.single('dwgFile'), projectController.importDwg);
router.get('/:projectId/export-dwg', authMiddleware, projectController.exportDwg);

// --- Aura Dashboard & Client Portal Routes ---
router.put('/:projectId/meta', authMiddleware, projectController.updateProjectMeta);
router.post('/:projectId/client-portal', authMiddleware, projectController.manageClientPortal);
router.get('/public/:shareableLink', projectController.getPublicProject);

// --- Architect's Folio & Showcase Routes ---
router.post('/:projectId/folio', authMiddleware, projectController.generateArchitectsFolio);
router.get('/folio/:shareableLink', projectController.getPublicFolio);
router.put('/:projectId/toggle-public', authMiddleware, projectController.toggleProjectPublicStatus);

// --- NEW: Holocron Presentation Routes ---
router.post('/:projectId/holocron', authMiddleware, projectController.generateHolocron);
router.get('/holocron/:shareableLink', projectController.getPublicHolocron);

// --- NEW: Digital Twin Route ---
router.get('/:projectId/digital-twin-data', authMiddleware, projectController.getDigitalTwinData);


// --- Marketplace Routes ---
router.get('/marketplace/templates', projectController.getMarketplaceProjects);
router.post('/:projectId/publish-as-template', authMiddleware, publishProjectValidation, handleValidation, projectController.publishProjectToMarketplace);
router.post('/marketplace/templates/:projectId/buy', authMiddleware, projectController.buyMarketplaceProject);

// --- NEW: Real Estate Exchange Routes ---
router.get('/exchange/listings', projectController.getExchangeListings);
router.post('/:projectId/tokenize', authMiddleware, tokenizeProjectValidation, handleValidation, projectController.tokenizeProject);

export default router;