// src/routes/geminiProxyRoutes.js
import express from 'express';
import * as geminiController from '../controllers/geminiController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import ownerMiddleware from '../middleware/ownerMiddleware.js'; // For owner-only routes

const router = express.Router();

// --- PUBLIC ROUTES (No Auth Required) ---
router.post('/generate-showcase-image', geminiController.generateShowcaseImage);
router.post('/public/generate-genesis-plan', geminiController.generatePublicGenesisPlan);

// --- AUTHENTICATED ROUTES ---
router.use(authMiddleware);

// Core Generation & Analysis
router.post('/refine-and-generate', geminiController.refineAndGeneratePlan);
router.post('/get-design-clarifications', geminiController.getDesignClarifications);
router.post('/get-strategic-advice', geminiController.getStrategicAdvice);
router.post('/generate-master-architect-plan', geminiController.generateMasterArchitectPlan);
router.post('/generate-genesis-plan', geminiController.generateGenesisPlan);
router.post('/generate-plan-from-image', geminiController.generatePlanFromImage);
router.post('/generate-multi-concept', geminiController.generateMultiConcept);
router.post('/generate-render', geminiController.generateRender);
router.post('/generate-image', geminiController.generateImage);

// Specific AI Tools
router.post('/get-support-response', geminiController.getSupportAgentResponse);
router.post('/research-with-google', geminiController.researchWithGoogle);
router.post('/run-oracle-analysis', geminiController.runOracleAnalysis);
router.post('/analyze-flow', geminiController.analyzeFlowAndErgonomics);
router.post('/generate-boq', geminiController.generateBoq);
router.post('/estimate-structure', geminiController.estimateStructure);
router.post('/analyze-sustainability', geminiController.analyzeSustainability);
router.post('/analyze-compliance', geminiController.analyzeCompliance);
router.post('/analyze-material', geminiController.analyzeMaterial);
router.post('/generate-blueprint-details', geminiController.generateBlueprintDetails);
router.post('/generate-project-certification', geminiController.generateProjectCertification);
router.post('/analyze-vastu-grid', geminiController.analyzeVastuGrid);
router.post('/generate-construction-plan', geminiController.generateConstructionPlan);
router.post('/generate-plumbing-layout', geminiController.generatePlumbingLayout);
router.post('/generate-electrical-layout', geminiController.generateElectricalLayout);
router.post('/generate-hvac-layout', geminiController.generateHvacLayout);
router.post('/generate-terrain', geminiController.generateTerrain);
router.post('/analyze-site', geminiController.analyzeSite);
router.post('/analyze-project-progress', geminiController.analyzeProjectProgress);
router.post('/generate-interior-scheme', geminiController.generateInteriorScheme);
router.post('/generate-landscape-plan', geminiController.generateLandscapePlan);
router.post('/resolve-design-comment', geminiController.resolveDesignComment);
router.post('/generate-cinematic-tour', geminiController.generateCinematicTour);
router.post('/generate-ar-suggestions', geminiController.generateArSuggestions);
router.post('/optimize-cost-sustainability', geminiController.optimizeCostAndSustainability);
router.post('/generate-master-plan', geminiController.generateMasterPlanLayout);
router.post('/analyze-site-media', geminiController.analyzeSiteMedia); // Phoenix Eye
router.post('/propose-juggernaut-fix', geminiController.proposeJuggernautFix); // NEW
router.post('/run-site-adjudicator', geminiController.runSiteAdjudicator); // NEW
router.post('/analyze-style-from-image', geminiController.analyzeInteriorStyleFromImage); // NEW
router.post('/run-samarangan-engine', geminiController.runSamaranganEngine); // NEW

// "Astra" Engines
router.post('/run-brahma-astra-engine', geminiController.runBrahmaAstraEngine);
router.post('/generate-fabrication-files', geminiController.generateFabricationFiles);
router.post('/run-indra-net-engine', geminiController.runIndraNetEngine);
router.post('/generate-gfc-drawings', geminiController.generateGfcDrawings);
router.post('/run-varuna-engine', geminiController.runVarunaEngine);
router.post('/run-loka-simulator', geminiController.runLokaSimulator);

// Grand Launch / Transcendence Engines
router.post('/run-navagraha-engine', geminiController.runNavagrahaEngine);
router.post('/run-akasha-engine', geminiController.runAkashaEngine);
router.post('/run-samsara-engine', geminiController.runSamsaraEngine);
router.post('/run-shilpa-sutra', geminiController.runShilpaSutraAnalysis);
router.post('/run-singularity-engine', geminiController.runSingularityEngine);

// Civil Engineering Engines
router.post('/run-prithvi-astra', geminiController.runPrithviAstraEngine);
router.post('/run-agni-astra', geminiController.runAgniAstraEngine);
router.post('/run-nexus-advisor', geminiController.runNexusAdvisor);

// Brahman & Juggernaut Protocols
router.post('/run-atman-signature', geminiController.runAtmanSignature);
router.post('/run-param-astra', geminiController.runParamAstra);
router.post('/run-sva-dharma-analyzer', geminiController.runSvaDharmaAnalyzer);
router.post('/analyze-visual-portfolio', geminiController.analyzeVisualPortfolio); // NEW
router.post('/run-samudra-manthan', geminiController.runSamudraManthan);

// --- OWNER-ONLY ADMIN AI TOOLS ---
// These routes are used by the Aura Command Center
router.post('/analyze-business-data', ownerMiddleware, geminiController.analyzeBusinessData);
router.post('/analyze-support-issues', ownerMiddleware, geminiController.analyzeSupportIssues);
router.post('/generate-social-media-post', ownerMiddleware, geminiController.generateSocialMediaPost);

export default router;
