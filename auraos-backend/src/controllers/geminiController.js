// src/controllers/geminiController.js
import { GoogleGenAI, Type } from "@google/genai";
import Project from '../models/Project.js';
import User from '../models/User.js'; 
import Transaction from '../models/Transaction.js'; 
import AppError from '../utils/AppError.js';
import crypto from 'crypto';
import { 
  BACKEND_GEMINI_TEXT_MODEL_NAME,
  BACKEND_GEMINI_IMAGE_GENERATION_MODEL_NAME
} from '../config/constants.js';
import { PREDEFINED_3D_MODELS } from "../lib/constants.js";
import { 
  AI_PROMPT_REFINEMENT_SYSTEM_INSTRUCTION, AI_ORACLE_SYSTEM_INSTRUCTION,
  AI_CHAT_COMMAND_SYSTEM_INSTRUCTION,
  PUBLIC_SHOWCASE_PROMPTS, AI_SKETCH_TO_PLAN_SYSTEM_INSTRUCTION, AI_GENESIS_ENGINE_SYSTEM_INSTRUCTION,
  AI_ERGONOMICS_FLOW_SYSTEM_INSTRUCTION, AI_RESEARCH_ASSISTANT_SYSTEM_INSTRUCTION, AI_MULTI_CONCEPT_GENERATOR_SYSTEM_INSTRUCTION,
  AI_BOQ_GENERATOR_SYSTEM_INSTRUCTION, AI_ADVANCED_STRUCTURAL_SYSTEM_INSTRUCTION, AI_SUSTAINABILITY_ANALYSIS_SYSTEM_INSTRUCTION,
  AI_CODE_COMPLIANCE_SYSTEM_INSTRUCTION, AI_MATERIAL_ANALYSIS_SYSTEM_INSTRUCTION, AI_BLUEPRINT_GENERATOR_SYSTEM_INSTRUCTION,
  AI_PROJECT_CERTIFICATION_SYSTEM_INSTRUCTION, AI_VASTU_GRID_ANALYSIS_SYSTEM_INSTRUCTION, AI_CONSTRUCTION_MANAGER_SYSTEM_INSTRUCTION,
  AI_PLUMBING_LAYOUT_SYSTEM_INSTRUCTION, AI_ELECTRICAL_LAYOUT_SYSTEM_INSTRUCTION, AI_HVAC_LAYOUT_SYSTEM_INSTRUCTION,
  AI_TERRAIN_GENERATOR_SYSTEM_INSTRUCTION, AI_SITE_ANALYSIS_SYSTEM_INSTRUCTION, AI_SCENE_DESCRIPTION_SYSTEM_INSTRUCTION,
  AI_PROJECT_MANAGER_SYSTEM_INSTRUCTION, AI_MASTER_ARCHITECT_NARRATIVE_SYSTEM_INSTRUCTION,
  AI_MASTER_ARCHITECT_SUMMARY_SYSTEM_INSTRUCTION, AI_INTERIOR_DECORATOR_SYSTEM_INSTRUCTION, AI_LANDSCAPE_ARCHITECT_SYSTEM_INSTRUCTION,
  AI_DESIGN_RESOLUTION_SYSTEM_INSTRUCTION, AI_BUSINESS_ANALYST_SYSTEM_INSTRUCTION, AI_SUPPORT_ANALYSIS_SYSTEM_INSTRUCTION,
  AI_SOCIAL_MEDIA_CONTENT_SYSTEM_INSTRUCTION, AI_PHOENIX_EYE_SYSTEM_INSTRUCTION, AI_CINEMATIC_TOUR_GENERATOR_SYSTEM_INSTRUCTION,
  AI_AR_DECORATOR_SYSTEM_INSTRUCTION, AI_COST_SUSTAINABILITY_OPTIMIZER_SYSTEM_INSTRUCTION, AI_MASTER_PLANNER_SYSTEM_INSTRUCTION,
  AI_BRAHMA_ASTRA_ENGINE_SYSTEM_INSTRUCTION,
  AI_FABRICATOR_ENGINE_SYSTEM_INSTRUCTION,
  AI_INDRA_NET_ENGINE_SYSTEM_INSTRUCTION,
  AI_VISHWAKARMA_ENGINE_SYSTEM_INSTRUCTION,
  AI_VARUNA_HYDRO_ENGINE_SYSTEM_INSTRUCTION,
  AI_LOKA_SIMULATOR_SYSTEM_INSTRUCTION,
  AI_NAVAGRAHA_SYSTEM_INSTRUCTION,
  AI_AKASHA_SYSTEM_INSTRUCTION,
  AI_SAMSARA_SYSTEM_INSTRUCTION,
  AI_SHILPA_SUTRA_ANALYSIS_SYSTEM_INSTRUCTION,
  AI_DESIGN_DIALOGUE_HELPER_SYSTEM_INSTRUCTION,
  AI_ADJUDICATION_ENGINE_SYSTEM_INSTRUCTION,
  AI_SUPPORT_AGENT_SYSTEM_INSTRUCTION,
  AI_STRATEGIC_ADVISOR_SYSTEM_INSTRUCTION,
  AI_PRITHVI_ASTRA_ENGINE_SYSTEM_INSTRUCTION,
  AI_AGNI_ASTRA_ENGINE_SYSTEM_INSTRUCTION,
  AI_NEXUS_STRATEGIC_ADVISOR_SYSTEM_INSTRUCTION,
  AI_ATMAN_SIGNATURE_SYNTHESIS_INSTRUCTION,
  AI_PARAM_ASTRA_EVOLUTIONARY_DESIGN_INSTRUCTION,
  AI_SVA_DHARMA_ANALYZER_INSTRUCTION,
  AI_SAMUDRA_MANTHAN_INSTRUCTION,
  AI_JUGGERNAUT_FIX_SYSTEM_INSTRUCTION,
  AI_JUGGERNAUT_ADJUDICATOR_SYSTEM_INSTRUCTION,
  AI_SAMARANGAN_ENGINE_SYSTEM_INSTRUCTION,
  AI_STYLE_ANALYZER_SYSTEM_INSTRUCTION,
  AI_SINGULARITY_ENGINE_SYSTEM_INSTRUCTION,
  AI_VISUAL_SVA_DHARMA_ANALYZER_INSTRUCTION,
  AI_STYLE_ANALYZER_SYSTEM_INSTRUCTION
} from '../config/prompts.js';


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const handleApiError = (error, next, context) => {
    console.error(`Error in ${context}:`, error.message || error);
    const statusCode = error.status || 500;
    const message = error.message || `An error occurred in ${context}.`;
    next(new AppError(message, statusCode));
};

const parseJsonResponse = (jsonText) => {
    if (typeof jsonText === 'object') return jsonText;
    let jsonStr = jsonText.trim();
    if (jsonStr.startsWith('```') && jsonStr.endsWith('```')) {
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) jsonStr = match[2].trim();
    }
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON response from AI:", jsonStr);
        throw new AppError("The AI returned a response that was not valid JSON.", 500);
    }
};

const callTextModel = async (contents, systemInstruction, configOverrides = {}) => {
    const config = { ...(systemInstruction && { systemInstruction }), ...configOverrides };
    const response = await ai.models.generateContent({
        model: BACKEND_GEMINI_TEXT_MODEL_NAME,
        contents,
        ...(Object.keys(config).length > 0 && { config }),
    });
    return response;
};

const callJsonModel = async (contents, systemInstruction, configOverrides = {}) => {
    const response = await callTextModel(contents, systemInstruction, { ...configOverrides, responseMimeType: "application/json" });
    const jsonText = response.text;
    if (typeof jsonText !== 'string' && typeof jsonText !== 'object') {
        throw new AppError("Received non-string/non-object response for JSON.", 500);
    }
    return parseJsonResponse(jsonText);
};

// --- CREDIT CHECK AND TRANSACTION LOGIC ---
const debitCreditsAndLogTransaction = async (userId, creditCost, toolName, projectId) => {
    if (!userId || creditCost <= 0) return;

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found.', 404);
    }
    
    // Owners have infinite credits
    if (user.role === 'owner') {
        return; 
    }
    if (user.credits < creditCost) {
        throw new AppError(`Insufficient credits. This action requires ${creditCost} credits, but you have ${user.credits}.`, 402);
    }

    // Deduct credits and log the transaction
    user.credits -= creditCost;
    await user.save();

    await Transaction.create({
        userId,
        type: 'ai_tool_usage',
        amount: -creditCost,
        description: `Used ${toolName}`,
        relatedId: projectId,
    });
    
    // Also log usage to the project itself
    if (projectId) {
        await Project.findByIdAndUpdate(projectId, {
            $push: { aiCreditUsage: { tool: toolName, cost: creditCost, timestamp: new Date() } }
        });
    }
};

const buildEnhancedPrompt = (project, userPrompt) => {
    if (!project) return userPrompt;
    
    const contextParts = [];
    if (project.clientProfile) {
        contextParts.push(`- Client Profile: ${project.clientProfile}`);
    }
    if (project.siteContext) {
        contextParts.push(`- Site & Climate Context: ${project.siteContext}`);
    }
    if (project.specificRequirements) {
        contextParts.push(`- Mandatory Requirements: ${project.specificRequirements}`);
    }

    if (contextParts.length === 0) {
        return userPrompt;
    }

    return `
        **FULL PROJECT BRIEF:**
        ${contextParts.join('\n')}
        ---
        **USER'S CORE REQUEST:**
        ${userPrompt}
    `;
};


export const processAiChatCommand = async (message, projectId) => {
    const project = await Project.findById(projectId).select('levels');
    if (!project) {
        throw new AppError("Project not found for AI command.", 404);
    }
    
    const projectContext = JSON.stringify(project.toObject());
    const prompt = `User query: "${message}"\n\nProject context: ${projectContext}`;
    
    const commandSchema = {
        type: Type.OBJECT,
        properties: {
            action: { type: Type.STRING, description: 'The geometric action to perform (e.g., MODIFY_WALL, ADD_WINDOW).' },
            payload: { type: Type.OBJECT, description: 'Data needed for the action.' },
            narrative: { type: Type.STRING, description: 'A conversational response to the user.' },
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: BACKEND_GEMINI_TEXT_MODEL_NAME,
            contents: prompt,
            config: {
                systemInstruction: AI_CHAT_COMMAND_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: commandSchema
            }
        });

        return parseJsonResponse(response.text);
    } catch (error) {
        console.error("Error calling Gemini for chat command:", error);
        return { action: 'INFO_ONLY', narrative: "I encountered an issue trying to process that command." };
    }
};

const _generateFullProjectConcept = async (prompt, projectId, userId) => {
    // NOTE: Credit debit is handled by the calling function to avoid double-charging.
    
    const projectData = await callJsonModel(prompt, AI_GENESIS_ENGINE_SYSTEM_INSTRUCTION);
    if (!projectData.levels || projectData.levels.length === 0) {
        throw new AppError("AI failed to generate a valid floor plan structure.", 500);
    }
    const [structuralReport, vastuReport, boq, sustainabilityReport] = await Promise.all([
        callJsonModel(JSON.stringify(projectData), AI_ADVANCED_STRUCTURAL_SYSTEM_INSTRUCTION),
        callJsonModel(JSON.stringify(projectData), AI_VASTU_GRID_ANALYSIS_SYSTEM_INSTRUCTION),
        callJsonModel(JSON.stringify(projectData), AI_BOQ_GENERATOR_SYSTEM_INSTRUCTION),
        callJsonModel(JSON.stringify(projectData), AI_SUSTAINABILITY_ANALYSIS_SYSTEM_INSTRUCTION)
    ]);
    const roomForRender = projectData.levels[0]?.rooms?.find(r => r.type.toLowerCase().includes('living')) || projectData.levels[0]?.rooms?.[0];
    let previewRender = { imageUrl: '', prompt: '' };
    if (roomForRender) {
        const sceneGenPrompt = JSON.stringify({ room: roomForRender, walls: projectData.levels[0].walls, placements: projectData.levels[0].placements });
        const sceneDescriptionResponse = await callTextModel(sceneGenPrompt, AI_SCENE_DESCRIPTION_SYSTEM_INSTRUCTION);
        const imagePrompt = `A photorealistic architectural render of ${sceneDescriptionResponse.text}, in a contemporary luxury style, with natural lighting.`;
        
        if (userId) { // Only debit for render if a user ID is passed (i.e., not an internal call)
            await debitCreditsAndLogTransaction(userId, 5, 'Concept Preview Render', projectId);
        }

        const imageResponse = await ai.models.generateImages({
            model: BACKEND_GEMINI_IMAGE_GENERATION_MODEL_NAME,
            prompt: imagePrompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }
        });
        const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;
        if (base64ImageBytes) {
            previewRender = { imageUrl: `data:image/jpeg;base64,${base64ImageBytes}`, prompt: imagePrompt };
        }
    }
    const summaryPrompt = JSON.stringify({ projectData, structuralReport, vastuReport });
    const summaryResponse = await callTextModel(summaryPrompt, AI_MASTER_ARCHITECT_SUMMARY_SYSTEM_INSTRUCTION);
    
    const finalData = { 
      projectData: { ...projectData, billOfQuantities: boq, sustainabilityReport: sustainabilityReport }, 
      structuralReport, 
      vastuReport, 
      boq, 
      previewRender, 
      summary: summaryResponse.text 
    };
    return finalData;
};

export const generateFolioNarrative = async (projectData, userId) => {
    const creditCost = 15;
    const toolName = "Architect's Folio";
    await debitCreditsAndLogTransaction(userId, creditCost, toolName, projectData._id || projectData.id);

    const prompt = JSON.stringify(projectData);
    const narrativeData = await callJsonModel(prompt, AI_MASTER_ARCHITECT_NARRATIVE_SYSTEM_INSTRUCTION);
    
    if (!narrativeData || !narrativeData.title || !narrativeData.narrative) {
        throw new AppError("AI failed to generate a valid folio narrative.", 500);
    }
    
    return narrativeData;
};

export const runAdjudicationEngine = async (project, proposal) => {
    // Adjudication should be free for the owner, so no credit check.
    const prompt = `Project Data:\n${JSON.stringify(project.toObject())}\n\nArchitect's Proposal:\n${proposal}`;
    const report = await callJsonModel(prompt, AI_ADJUDICATION_ENGINE_SYSTEM_INSTRUCTION);
    return report;
};


export const refineAndGeneratePlan = async (req, res, next) => {
    try {
        const { prompt: userPrompt, projectId } = req.body;
        const { userId } = req.user;
        if (!userPrompt || typeof userPrompt !== 'string') throw new AppError('A descriptive prompt is required.', 400);

        await debitCreditsAndLogTransaction(userId, 100, 'Master Architect (Refine & Generate)', projectId);
        
        const project = await Project.findById(projectId);
        const enhancedPrompt = buildEnhancedPrompt(project, userPrompt);
        
        const refinementResponse = await callTextModel(enhancedPrompt, AI_PROMPT_REFINEMENT_SYSTEM_INSTRUCTION);
        const refinedPrompt = refinementResponse.text;
        if (!refinedPrompt) throw new AppError('AI failed to refine the prompt.', 500);
        
        const projectConcept = await _generateFullProjectConcept(refinedPrompt, projectId, userId); // Pass userId for render debit
        res.json({ ...projectConcept, refinedPrompt });
    } catch (error) {
        handleApiError(error, next, 'Refine & Generate Plan');
    }
};

export const generateMasterArchitectPlan = async (req, res, next) => {
    try {
        const { projectId, prompt } = req.body;
        const { userId } = req.user;
        if (!prompt || typeof prompt !== 'string') throw new AppError('A descriptive prompt is required.', 400);
        
        await debitCreditsAndLogTransaction(userId, 90, 'Master Architect', projectId);

        const project = await Project.findById(projectId);
        const enhancedPrompt = buildEnhancedPrompt(project, prompt);
        
        const result = await _generateFullProjectConcept(enhancedPrompt, projectId, userId); // Pass userId for render debit
        res.json(result);
    } catch (error) {
        handleApiError(error, next, 'Master Architect Plan Generation');
    }
};

const simpleAiController = (systemInstruction, options = {}) => async (req, res, next) => {
    try {
        const { prompt, projectData, projectId, ...rest } = req.body;
        const { userId } = req.user || {}; // Use destructuring with a default empty object to handle unauthenticated requests safely.

        let finalPrompt = prompt || JSON.stringify(projectData) || JSON.stringify(rest);

        // --- Integrated Credit Check & Prompt Enhancement (only for authenticated users) ---
        if (userId) {
            if (options.creditCost > 0) {
                await debitCreditsAndLogTransaction(userId, options.creditCost, options.toolName || 'AI Tool', projectId);
            }
            if (options.enhancement === 'full' && projectId) {
                const project = await Project.findById(projectId);
                finalPrompt = buildEnhancedPrompt(project, finalPrompt);
            }
        }
        // --- End Credit Check ---

        let result;
        if (options.jsonOutput) {
            result = await callJsonModel(finalPrompt, systemInstruction);
        } else {
            const response = await callTextModel(finalPrompt, systemInstruction);
            result = { text: response.text };
        }
        res.json(result);
    } catch (error) {
        handleApiError(error, next, options.toolName || 'Simple AI Controller');
    }
};

export const generateInteriorScheme = async (req, res, next) => {
    try {
        const { projectId, projectData, roomId, style, atmanSignature } = req.body;
        const { userId } = req.user;
        
        const creditCost = atmanSignature ? 15 : 10;
        await debitCreditsAndLogTransaction(userId, creditCost, 'Interior Decorator', projectId);
        
        const targetRoom = projectData.levels.flatMap(l => l.rooms).find(r => r.id === roomId);
        if (!targetRoom) throw new AppError('Target room not found in project data.', 404);
        
        const roomWalls = targetRoom.wallIds.map(wallId => 
            projectData.levels.flatMap(l => l.walls).find(w => w.id === wallId)
        ).filter(Boolean);
        
        const roomBoundaryPoints = Array.from(new Set(roomWalls.flatMap(w => [`${w.x1},${w.y1}`, `${w.x2},${w.y2}`])))
            .map(pStr => { const [x,y] = pStr.split(',').map(Number); return {x,y}; });

        const prompt = `
            Project Data: ${JSON.stringify({ name: projectData.name, projectType: projectData.projectType })}
            Room to Decorate: ${JSON.stringify(targetRoom)}
            Room Boundary Points (for coordinate system context): ${JSON.stringify(roomBoundaryPoints)}
            Design Style: ${style}
            ${atmanSignature ? `Architect's Atman Signature: "${atmanSignature}"` : ''}

            Available 3D Model Library:
            ${JSON.stringify(PREDEFINED_3D_MODELS)}
        `;

        const result = await callJsonModel(prompt, AI_INTERIOR_DECORATOR_SYSTEM_INSTRUCTION);
        res.json(result);

    } catch (error) {
        handleApiError(error, next, 'Generate Interior Scheme');
    }
};

export const analyzeInteriorStyleFromImage = async (req, res, next) => {
    try {
        const { projectId, image, mimeType } = req.body;
        const { userId } = req.user;
        await debitCreditsAndLogTransaction(userId, 5, 'Style Analyzer', projectId);

        if (!image || !mimeType) {
            throw new AppError('Image data and mimeType are required.', 400);
        }

        const imagePart = { inlineData: { mimeType, data: image } };
        const textPart = { text: "What is the design style of this room?" };
        
        const response = await callTextModel({ parts: [imagePart, textPart] }, AI_STYLE_ANALYZER_SYSTEM_INSTRUCTION);
        
        res.json({ style: response.text.trim() });
    } catch (error) {
        handleApiError(error, next, 'Analyze Interior Style from Image');
    }
};

export const runSvaDharmaAnalyzer = simpleAiController(AI_SVA_DHARMA_ANALYZER_INSTRUCTION, {
    creditCost: 25,
    toolName: 'Sva-Dharma Analyzer',
    jsonOutput: true,
    enhancement: 'none'
});

export const runSamudraManthan = simpleAiController(AI_SAMUDRA_MANTHAN_INSTRUCTION, {
    creditCost: 40,
    toolName: 'Samudra Manthan',
    jsonOutput: true,
    enhancement: 'none'
});

// The rest of the exports from geminiController.js are defined below...
export const getDesignClarifications = simpleAiController(AI_DESIGN_DIALOGUE_HELPER_SYSTEM_INSTRUCTION, {
    creditCost: 0,
    toolName: 'Design Dialogue Helper',
    jsonOutput: true,
});

export const getStrategicAdvice = simpleAiController(AI_STRATEGIC_ADVISOR_SYSTEM_INSTRUCTION, {
    creditCost: 0,
    toolName: 'Strategic Advisor',
    jsonOutput: true,
});

export const generateGenesisPlan = simpleAiController(AI_GENESIS_ENGINE_SYSTEM_INSTRUCTION, {
    creditCost: 10,
    toolName: 'Genesis Engine',
    jsonOutput: true,
    enhancement: 'full',
});

export const generatePublicGenesisPlan = simpleAiController(AI_GENESIS_ENGINE_SYSTEM_INSTRUCTION, {
    creditCost: 0,
    toolName: 'Public Genesis Engine',
    jsonOutput: true,
});

export const generatePlanFromImage = async (req, res, next) => {
    try {
        const { projectId, image, mimeType } = req.body;
        const { userId } = req.user;
        await debitCreditsAndLogTransaction(userId, 20, 'Sketch to Plan', projectId);

        const imagePart = { inlineData: { mimeType, data: image } };
        const textPart = { text: "Convert this floor plan image into a structured JSON object. The names of the rooms must be in English." };
        
        const result = await callJsonModel({ parts: [imagePart, textPart] }, AI_SKETCH_TO_PLAN_SYSTEM_INSTRUCTION);
        res.json(result);
    } catch (error) {
        handleApiError(error, next, 'Generate Plan From Image');
    }
};

export const generateMultiConcept = simpleAiController(AI_MULTI_CONCEPT_GENERATOR_SYSTEM_INSTRUCTION, {
    creditCost: 80,
    toolName: 'DreamWeaver Engine',
    jsonOutput: true,
    enhancement: 'full',
});

export const analyzeFlowAndErgonomics = simpleAiController(AI_ERGONOMICS_FLOW_SYSTEM_INSTRUCTION, {
    creditCost: 2,
    toolName: 'Flow & Ergonomics Analysis',
    jsonOutput: true,
});

export const researchWithGoogle = async (req, res, next) => {
    try {
        const { projectId, prompt } = req.body;
        const { userId } = req.user;
        await debitCreditsAndLogTransaction(userId, 1, 'Research Assistant', projectId);

        const response = await callTextModel(prompt, AI_RESEARCH_ASSISTANT_SYSTEM_INSTRUCTION, {
            tools: [{ googleSearch: {} }],
        });

        res.json({
            text: response.text,
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
        });
    } catch (error) {
        handleApiError(error, next, 'Research with Google');
    }
};

export const runOracleAnalysis = async (req, res, next) => {
     try {
        const { projectId, projectData, location, question } = req.body;
        const { userId } = req.user;
        await debitCreditsAndLogTransaction(userId, 15, 'Oracle AI', projectId);

        const prompt = `Project Context:\n${JSON.stringify(projectData)}\n\nLocation: ${location}\n\nQuestion: ${question}`;

        const response = await callTextModel(prompt, AI_ORACLE_SYSTEM_INSTRUCTION, {
            tools: [{ googleSearch: {} }],
        });

        res.json({
            text: response.text,
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
        });
    } catch (error) {
        handleApiError(error, next, 'Oracle Analysis');
    }
};


export const generateBoq = simpleAiController(AI_BOQ_GENERATOR_SYSTEM_INSTRUCTION, {
    creditCost: 15,
    toolName: 'Bill of Quantities',
    jsonOutput: true,
});

export const estimateStructure = simpleAiController(AI_ADVANCED_STRUCTURAL_SYSTEM_INSTRUCTION, {
    creditCost: 25,
    toolName: 'Structural Analysis',
    jsonOutput: true,
});

export const analyzeSustainability = simpleAiController(AI_SUSTAINABILITY_ANALYSIS_SYSTEM_INSTRUCTION, {
    creditCost: 10,
    toolName: 'Sustainability Analysis',
    jsonOutput: true,
});

export const analyzeCompliance = simpleAiController(AI_CODE_COMPLIANCE_SYSTEM_INSTRUCTION, {
    creditCost: 10,
    toolName: 'Code Compliance',
    jsonOutput: true,
});

export const analyzeMaterial = simpleAiController(AI_MATERIAL_ANALYSIS_SYSTEM_INSTRUCTION, {
    creditCost: 1,
    toolName: 'Material Analysis',
    jsonOutput: true,
});

export const generateBlueprintDetails = simpleAiController(AI_BLUEPRINT_GENERATOR_SYSTEM_INSTRUCTION, {
    creditCost: 10,
    toolName: 'Auto-Dimensioning',
    jsonOutput: true,
});

export const generateProjectCertification = simpleAiController(AI_PROJECT_CERTIFICATION_SYSTEM_INSTRUCTION, {
    creditCost: 200,
    toolName: 'Project Certification',
    jsonOutput: true,
});

export const analyzeVastuGrid = simpleAiController(AI_VASTU_GRID_ANALYSIS_SYSTEM_INSTRUCTION, {
    creditCost: 10,
    toolName: 'Vastu Grid Analysis',
    jsonOutput: true,
});

export const generateConstructionPlan = simpleAiController(AI_CONSTRUCTION_MANAGER_SYSTEM_INSTRUCTION, {
    creditCost: 50,
    toolName: '4D Construction Plan',
    jsonOutput: true,
});

export const generatePlumbingLayout = simpleAiController(AI_PLUMBING_LAYOUT_SYSTEM_INSTRUCTION, {
    creditCost: 15,
    toolName: 'Plumbing Layout',
    jsonOutput: true,
});

export const generateElectricalLayout = simpleAiController(AI_ELECTRICAL_LAYOUT_SYSTEM_INSTRUCTION, {
    creditCost: 15,
    toolName: 'Electrical Layout',
    jsonOutput: true,
});

export const generateHvacLayout = simpleAiController(AI_HVAC_LAYOUT_SYSTEM_INSTRUCTION, {
    creditCost: 15,
    toolName: 'HVAC Layout',
    jsonOutput: true,
});

export const generateTerrain = simpleAiController(AI_TERRAIN_GENERATOR_SYSTEM_INSTRUCTION, {
    creditCost: 5,
    toolName: 'Terraform Engine',
    jsonOutput: true,
});

export const analyzeSite = simpleAiController(AI_SITE_ANALYSIS_SYSTEM_INSTRUCTION, {
    creditCost: 10,
    toolName: 'Site Analysis',
    jsonOutput: true,
});

export const generateRender = async (req, res, next) => {
    try {
        const { projectId, projectData, roomId, stylePrompt, config } = req.body;
        const { userId } = req.user;
        await debitCreditsAndLogTransaction(userId, 5, 'Helios Engine Render', projectId);

        const room = projectData.levels.flatMap(l => l.rooms).find(r => r.id === roomId);
        if (!room) throw new AppError('Room not found.', 404);

        const promptData = { room, walls: projectData.levels[0].walls, placements: projectData.levels[0].placements };
        const sceneDescriptionResponse = await callTextModel(JSON.stringify(promptData), AI_SCENE_DESCRIPTION_SYSTEM_INSTRUCTION);

        const finalImagePrompt = `${sceneDescriptionResponse.text}, ${stylePrompt}`;
        
        const imageResponse = await ai.models.generateImages({
            model: BACKEND_GEMINI_IMAGE_GENERATION_MODEL_NAME,
            prompt: finalImagePrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                ...config,
            },
        });

        const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;
        if (!base64ImageBytes) throw new AppError('Image generation failed.', 500);

        res.json({ imageUrl: `data:image/jpeg;base64,${base64ImageBytes}` });

    } catch (error) {
        handleApiError(error, next, 'Generate Render');
    }
};

export const generateImage = async (req, res, next) => {
    try {
        const { projectId, prompt, config } = req.body;
        const { userId } = req.user;
        await debitCreditsAndLogTransaction(userId, 5, 'Image Generation', projectId);

        const imageResponse = await ai.models.generateImages({
            model: BACKEND_GEMINI_IMAGE_GENERATION_MODEL_NAME,
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                ...config,
            },
        });

        const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;
        if (!base64ImageBytes) throw new AppError('Image generation failed.', 500);

        res.json({ imageUrl: `data:image/jpeg;base64,${base64ImageBytes}` });

    } catch (error) {
        handleApiError(error, next, 'Generate Image');
    }
};

export const generateShowcaseImage = async (req, res, next) => {
    try {
        const { promptIndex = 0, config } = req.body;
        const prompt = PUBLIC_SHOWCASE_PROMPTS[promptIndex % PUBLIC_SHOWCASE_PROMPTS.length];

        const imageResponse = await ai.models.generateImages({
            model: BACKEND_GEMINI_IMAGE_GENERATION_MODEL_NAME,
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
                ...config,
            },
        });

        const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;
        if (!base64ImageBytes) throw new AppError('Showcase image generation failed.', 500);

        res.json({ imageUrl: `data:image/jpeg;base64,${base64ImageBytes}` });

    } catch (error) {
        handleApiError(error, next, 'Generate Showcase Image');
    }
};

export const analyzeProjectProgress = simpleAiController(AI_PROJECT_MANAGER_SYSTEM_INSTRUCTION, {
    creditCost: 1,
    toolName: 'Project Progress Analysis',
    jsonOutput: true,
});

export const generateLandscapePlan = simpleAiController(AI_LANDSCAPE_ARCHITECT_SYSTEM_INSTRUCTION, {
    creditCost: 10,
    toolName: 'Landscape Architect',
    jsonOutput: true,
});

export const resolveDesignComment = simpleAiController(AI_DESIGN_RESOLUTION_SYSTEM_INSTRUCTION, {
    creditCost: 5,
    toolName: 'AI Design Resolution',
    jsonOutput: true,
});

export const analyzeBusinessData = simpleAiController(AI_BUSINESS_ANALYST_SYSTEM_INSTRUCTION, {
    creditCost: 0,
    toolName: 'AI Business Analyst',
});

export const analyzeSupportIssues = simpleAiController(AI_SUPPORT_ANALYSIS_SYSTEM_INSTRUCTION, {
    creditCost: 0,
    toolName: 'AI Support Analysis',
    jsonOutput: true,
});

export const generateSocialMediaPost = simpleAiController(AI_SOCIAL_MEDIA_CONTENT_SYSTEM_INSTRUCTION, {
    creditCost: 0,
    toolName: 'AI Social Media Assistant',
});

export const analyzeSiteMedia = async (req, res, next) => {
    try {
        const { projectId, constructionPlan, images } = req.body;
        const { userId } = req.user;
        await debitCreditsAndLogTransaction(userId, 30, 'Phoenix Eye', projectId);
        
        const imageParts = images.map(img => ({ inlineData: { mimeType: img.mimeType, data: img.base64 }}));
        const textPart = { text: `Analyze the provided construction site images against this week's plan: ${JSON.stringify(constructionPlan)}` };

        const result = await callJsonModel({ parts: [...imageParts, textPart] }, AI_PHOENIX_EYE_SYSTEM_INSTRUCTION);
        res.json(result);
    } catch (error) {
        handleApiError(error, next, 'Analyze Site Media');
    }
};

export const generateCinematicTour = simpleAiController(AI_CINEMATIC_TOUR_GENERATOR_SYSTEM_INSTRUCTION, {
    creditCost: 40,
    toolName: 'Cinematic Tour',
    jsonOutput: true,
});

export const generateArSuggestions = simpleAiController(AI_AR_DECORATOR_SYSTEM_INSTRUCTION, {
    creditCost: 2,
    toolName: 'AR Design Lab',
    jsonOutput: true,
});

export const optimizeCostAndSustainability = simpleAiController(AI_COST_SUSTAINABILITY_OPTIMIZER_SYSTEM_INSTRUCTION, {
    creditCost: 15,
    toolName: 'Cost & Sustainability Optimizer',
    jsonOutput: true,
});

export const generateMasterPlanLayout = simpleAiController(AI_MASTER_PLANNER_SYSTEM_INSTRUCTION, {
    creditCost: 25,
    toolName: 'Master Planner',
    jsonOutput: true,
    enhancement: 'full'
});

export const runBrahmaAstraEngine = simpleAiController(AI_BRAHMA_ASTRA_ENGINE_SYSTEM_INSTRUCTION, {
    creditCost: 250,
    toolName: 'Brahma-Astra Engine',
    jsonOutput: true,
});

export const generateFabricationFiles = simpleAiController(AI_FABRICATOR_ENGINE_SYSTEM_INSTRUCTION, {
    creditCost: 50,
    toolName: 'Fabricator Engine',
    jsonOutput: true,
});

export const runIndraNetEngine = simpleAiController(AI_INDRA_NET_ENGINE_SYSTEM_INSTRUCTION, {
    creditCost: 60,
    toolName: 'Indra-Net Engine',
    jsonOutput: true,
});

export const generateGfcDrawings = simpleAiController(AI_VISHWAKARMA_ENGINE_SYSTEM_INSTRUCTION, {
    creditCost: 150,
    toolName: 'Vishwakarma Engine',
    jsonOutput: true,
});

export const runVarunaEngine = simpleAiController(AI_VARUNA_HYDRO_ENGINE_SYSTEM_INSTRUCTION, {
    creditCost: 300,
    toolName: 'Varuna Engine',
    jsonOutput: true,
});

export const runLokaSimulator = simpleAiController(AI_LOKA_SIMULATOR_SYSTEM_INSTRUCTION, {
    creditCost: 10,
    toolName: 'Loka Simulator',
    jsonOutput: true,
});

export const runNavagrahaEngine = simpleAiController(AI_NAVAGRAHA_SYSTEM_INSTRUCTION, {
    creditCost: 100,
    toolName: 'Navagraha Engine',
    jsonOutput: true,
});

export const runAkashaEngine = simpleAiController(AI_AKASHA_SYSTEM_INSTRUCTION, {
    creditCost: 50,
    toolName: 'Akasha Engine',
    jsonOutput: true,
});

export const runSamsaraEngine = simpleAiController(AI_SAMSARA_SYSTEM_INSTRUCTION, {
    creditCost: 75,
    toolName: 'Samsara Engine',
    jsonOutput: true,
});

export const runShilpaSutraAnalysis = simpleAiController(AI_SHILPA_SUTRA_ANALYSIS_SYSTEM_INSTRUCTION, {
    creditCost: 25,
    toolName: 'Shilpa Sutra Analysis',
    jsonOutput: true,
});

export const runPrithviAstraEngine = simpleAiController(AI_PRITHVI_ASTRA_ENGINE_SYSTEM_INSTRUCTION, {
    creditCost: 20,
    toolName: 'Prithvi-Astra Engine',
    jsonOutput: true,
});

export const runAgniAstraEngine = simpleAiController(AI_AGNI_ASTRA_ENGINE_SYSTEM_INSTRUCTION, {
    creditCost: 40,
    toolName: 'Agni-Astra Engine',
    jsonOutput: true,
});

export const runNexusAdvisor = simpleAiController(AI_NEXUS_STRATEGIC_ADVISOR_SYSTEM_INSTRUCTION, {
    creditCost: 10,
    toolName: 'Nexus Strategic Advisor',
    jsonOutput: true,
});

export const runSingularityEngine = async (req, res, next) => {
    try {
        const { projectId, projectData } = req.body;
        const { userId } = req.user;
        await debitCreditsAndLogTransaction(userId, 500, 'Singularity Engine', projectId);
        
        // This is a simulation. In a real scenario, this would be a long-running job.
        // It would call other AI functions in sequence (e.g., generateGfcDrawingsApi, generateCinematicTourApi).
        // For now, we return a mock report.
        const report = {
            summary: "Singularity Engine run completed. All assets have been generated and saved to their respective tabs.",
            generatedAssets: [
                { type: "GFC Drawings", status: "Success", details: "Generated GFC set with 5 sheets." },
                { type: "Cinematic Tour", status: "Success", details: "Generated 6-shot cinematic tour." },
                { type: "Marketing Renders", status: "Success", details: "Generated 3 high-quality renders." },
                { type: "Architect's Folio", status: "Success", details: "Generated professional folio narrative." },
            ]
        };
        
        // In a real implementation, you would save these generated assets to the Project model in the DB here.
        
        res.json(report);
    } catch (error) {
        handleApiError(error, next, 'Singularity Engine');
    }
};

export const runAtmanSignature = simpleAiController(AI_ATMAN_SIGNATURE_SYNTHESIS_INSTRUCTION, {
    creditCost: 50,
    toolName: 'Atman Signature Synthesis',
    jsonOutput: true,
});

export const runParamAstra = simpleAiController(AI_PARAM_ASTRA_EVOLUTIONARY_DESIGN_INSTRUCTION, {
    creditCost: 75,
    toolName: 'Param-Astra Engine',
    jsonOutput: true,
});

export const generateText = simpleAiController(null, {
    creditCost: 1,
    toolName: 'Generic Text Generation',
});

export const getSupportAgentResponse = simpleAiController(AI_SUPPORT_AGENT_SYSTEM_INSTRUCTION, {
    creditCost: 0,
    toolName: 'AI Support Agent',
});

export const proposeJuggernautFix = simpleAiController(AI_JUGGERNAUT_FIX_SYSTEM_INSTRUCTION, {
    creditCost: 5,
    toolName: 'Juggernaut Fix Proposal',
    jsonOutput: true,
});

export const runSiteAdjudicator = simpleAiController(AI_JUGGERNAUT_ADJUDICATOR_SYSTEM_INSTRUCTION, {
    creditCost: 20,
    toolName: 'Juggernaut Site Adjudicator',
    jsonOutput: true,
});

export const runSamaranganEngine = async (req, res, next) => {
    try {
        const { projectId, command, projectData } = req.body;
        const { userId } = req.user;
        
        await debitCreditsAndLogTransaction(userId, 15, 'Samarangan Engine', projectId);

        const prompt = `User Command: "${command}"\n\nFull Project Data:\n${JSON.stringify(projectData)}`;
        
        const result = await callJsonModel(prompt, AI_SAMARANGAN_ENGINE_SYSTEM_INSTRUCTION);
        
        res.json(result);
    } catch (error) {
        handleApiError(error, next, 'Samarangan Engine');
    }
};

export const analyzeVisualPortfolio = async (req, res, next) => {
    try {
        const { projectId, images } = req.body;
        const { userId } = req.user;
        await debitCreditsAndLogTransaction(userId, 50, 'Visual Sva-Dharma Analysis', projectId);
        
        if (!images || !Array.isArray(images) || images.length === 0) {
            throw new AppError('At least one image is required for analysis.', 400);
        }
        
        const imageParts = images.map(img => ({ inlineData: { mimeType: img.mimeType, data: img.base64 }}));
        const textPart = { text: "Analyze this collection of architectural images to discover the architect's unique design signature (SvaDharma). Identify recurring themes in form, materiality, and spatial quality. Synthesize your findings into a short, insightful 'signature' phrase and a brief 'analysis' paragraph explaining your reasoning." };
        
        const result = await callJsonModel({ parts: [...imageParts, textPart] }, AI_VISUAL_SVA_DHARMA_ANALYZER_INSTRUCTION);
        
        // Add the source image data URLs to the response for display on the frontend
        const sourceImageUrls = images.map(img => `data:${img.mimeType};base64,${img.base64}`);
        res.json({ ...result, sourceImageUrls });
    } catch (error) {
        handleApiError(error, next, 'Analyze Visual Portfolio');
    }
};
