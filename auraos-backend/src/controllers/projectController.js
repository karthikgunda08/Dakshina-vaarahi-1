
// src/controllers/projectController.js
import Project from '../models/Project.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js'; 
import ProjectVersion from '../models/ProjectVersion.js';
import DxfParser from 'dxf-parser';
import DxfWriter from 'dxf-writer';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { generateFolioNarrative } from './geminiController.js';
import AppError from '../utils/AppError.js';
import * as emailService from '../services/emailService.js';

const generateId = (prefix) => `${prefix}_${new Date().getTime()}_${Math.random().toString(36).substring(2, 7)}`;

export const createOrUpdateProject = async (req, res, next) => {
  try {
    const { userId } = req.user; 
    const { name, projectType, levels, planNorthDirection, propertyLines, terrainMesh, stagingSettings, savedCameraViews, existingProjectId, commitMessage, commitType, location, billOfQuantities, sustainabilityReport, aiCreditUsage, clientProfile, siteContext, specificRequirements, holocron, storyboard, juggernautReport } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return next(new AppError('Project name is required and must be a string.', 400));
    }

    let savedProject;
    if (existingProjectId) {
      if (!mongoose.Types.ObjectId.isValid(existingProjectId)) {
        return next(new AppError('Invalid project ID format.', 400));
      }
      
      const projectToUpdate = await Project.findOne({ 
          _id: existingProjectId,
          // SECURITY FIX APPLIED: Allows the owner OR an invited editor to save the project.
          $or: [
            { userId: userId }, 
            { 'collaborators': { $elemMatch: { userId: userId, role: 'editor' } } }
          ],
      });

      if (!projectToUpdate) {
        return next(new AppError("Project not found or you don't have permission to update it.", 404));
      }

      await ProjectVersion.create({
          projectId: projectToUpdate._id,
          versionNumber: projectToUpdate.version,
          commitMessage: commitMessage || (commitType === 'auto' ? 'Auto-saved changes' : `Version ${projectToUpdate.version}`),
          type: commitType || 'manual',
          projectData: {
              levels: projectToUpdate.levels,
              planNorthDirection: projectToUpdate.planNorthDirection,
              propertyLines: projectToUpdate.propertyLines,
              terrainMesh: projectToUpdate.terrainMesh,
              stagingSettings: projectToUpdate.stagingSettings,
              savedCameraViews: projectToUpdate.savedCameraViews,
              location: projectToUpdate.location,
              clientProfile: projectToUpdate.clientProfile,
              siteContext: projectToUpdate.siteContext,
              specificRequirements: projectToUpdate.specificRequirements,
              holocron: projectToUpdate.holocron,
              storyboard: projectToUpdate.storyboard,
              juggernautReport: projectToUpdate.juggernautReport,
          }
      });

      projectToUpdate.name = name.trim();
      projectToUpdate.projectType = projectType || 'building';
      projectToUpdate.location = location; 
      projectToUpdate.levels = levels || [];
      projectToUpdate.planNorthDirection = planNorthDirection || 'N';
      projectToUpdate.propertyLines = propertyLines || [];
      projectToUpdate.terrainMesh = terrainMesh || null;
      projectToUpdate.stagingSettings = stagingSettings;
      projectToUpdate.savedCameraViews = savedCameraViews;
      projectToUpdate.billOfQuantities = billOfQuantities;
      projectToUpdate.sustainabilityReport = sustainabilityReport;
      projectToUpdate.aiCreditUsage = aiCreditUsage;
      projectToUpdate.clientProfile = clientProfile;
      projectToUpdate.siteContext = siteContext;
      projectToUpdate.specificRequirements = specificRequirements;
      projectToUpdate.holocron = holocron;
      projectToUpdate.storyboard = storyboard;
      projectToUpdate.juggernautReport = juggernautReport;
      projectToUpdate.version += 1;
      
      savedProject = await projectToUpdate.save({ runValidators: true });
      res.status(200).json({ project: savedProject.toObject(), message: 'Project updated successfully!' });
    } else {
      const newProjectInstance = new Project({
          name: name.trim(), projectType: projectType || 'building', levels,
          planNorthDirection, propertyLines, terrainMesh, stagingSettings, savedCameraViews, location,
          userId, version: 1, billOfQuantities, sustainabilityReport, aiCreditUsage,
          clientProfile, siteContext, specificRequirements, holocron, storyboard, juggernautReport
      });
      savedProject = await newProjectInstance.save();
      await ProjectVersion.create({
          projectId: savedProject._id,
          versionNumber: 1,
          commitMessage: commitMessage || 'Initial commit',
          type: 'manual',
          projectData: { levels, planNorthDirection, propertyLines, terrainMesh, stagingSettings, savedCameraViews, location, clientProfile, siteContext, specificRequirements, holocron, storyboard, juggernautReport }
      });
      res.status(201).json({ project: savedProject.toObject(), message: 'Project created successfully!' });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new AppError(error.message, 400));
    }
    next(error);
  }
};

export const updateProjectName = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { projectId } = req.params;
        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return next(new AppError('Project name is required.', 400));
        }

        const project = await Project.findOneAndUpdate(
            { _id: projectId, userId: userId }, // Ensure only the owner can change the name
            { name: name.trim() },
            { new: true, runValidators: true }
        ).select('id name');

        if (!project) {
            return next(new AppError('Project not found or you do not have permission to edit it.', 404));
        }
        
        res.json(project.toObject());

    } catch (error) {
        next(error);
    }
};


export const getProjectVersions = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.user;
        
        const project = await Project.findOne({ 
            _id: projectId, 
            $or: [{ userId: userId }, { 'collaborators.userId': userId }],
        });
        if (!project) {
            return next(new AppError("Project not found or you don't have permission.", 404));
        }

        const versions = await ProjectVersion.find({ projectId })
            .sort({ versionNumber: -1 })
            .select('versionNumber commitMessage createdAt');
        
        res.json(versions.map(v => v.toObject()));

    } catch (error) {
        next(error);
    }
};

export const restoreProjectVersion = async (req, res, next) => {
    try {
        const { projectId, versionId } = req.params;
        const { userId } = req.user;

        const project = await Project.findOne({ 
            _id: projectId,
            $or: [{ userId: userId }, { 'collaborators': { $elemMatch: { userId: userId, role: 'editor' } } }],
        });
        if (!project) {
            return next(new AppError("Project not found or you don't have permission.", 404));
        }
        
        const versionToRestore = await ProjectVersion.findById(versionId);
        if (!versionToRestore || versionToRestore.projectId.toString() !== projectId) {
             return next(new AppError("Version not found for this project.", 404));
        }
        
        const restoredData = versionToRestore.projectData;
        project.levels = restoredData.levels;
        project.planNorthDirection = restoredData.planNorthDirection;
        project.propertyLines = restoredData.propertyLines;
        project.terrainMesh = restoredData.terrainMesh;
        project.stagingSettings = restoredData.stagingSettings;
        project.savedCameraViews = restoredData.savedCameraViews;
        project.location = restoredData.location; 
        project.clientProfile = restoredData.clientProfile;
        project.siteContext = restoredData.siteContext;
        project.specificRequirements = restoredData.specificRequirements;
        project.holocron = restoredData.holocron;
        project.storyboard = restoredData.storyboard;
        project.juggernautReport = restoredData.juggernautReport;
        
        project.version += 1;
        
        const restoredProject = await project.save();
        
        await ProjectVersion.create({
            projectId: project._id,
            versionNumber: project.version,
            commitMessage: `Restored from version ${versionToRestore.versionNumber}`,
            projectData: versionToRestore.projectData,
            restoredFrom: versionToRestore.versionNumber,
        });

        res.json({ project: restoredProject.toObject(), message: `Project restored to version ${versionToRestore.versionNumber}` });

    } catch (error) {
        next(error);
    }
};


export const getUserProjects = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const projects = await Project.find({
        $or: [{ userId: userId }, { 'collaborators.userId': userId }],
    })
      .sort({ updatedAt: -1 }) 
      .populate('userId', 'name email')
      .populate('collaborators.userId', 'name email profileImageUrl')
      .select('name updatedAt createdAt projectType isPublic collaborators isForSale marketplace tokenization previewImageUrl folio');

    res.json(projects.map(p => p.toObject())); 
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return next(new AppError('Invalid project ID format.', 400));
    }
    const project = await Project.findOne({ 
        _id: projectId,
        $or: [{ userId: userId }, { 'collaborators.userId': userId }],
    }).populate('collaborators.userId', 'name email profileImageUrl');
    
    if (!project) {
      return next(new AppError('Project not found or you do not have access.', 404));
    }
    res.json(project.toObject());
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return next(new AppError('Invalid project ID format.', 400));
    }
    const result = await Project.findOneAndDelete({ _id: projectId, userId: userId });

    if (!result) {
      return next(new AppError('Project not found or you do not have permission to delete it.', 404));
    }
    await ProjectVersion.deleteMany({ projectId: projectId });
    res.status(200).json({ message: 'Project and its history deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// --- Project Analytics ---
export const getProjectAnalytics = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId).select('billOfQuantities sustainabilityReport aiCreditUsage');
        if (!project) {
            return next(new AppError('Project not found.', 404));
        }

        // Calculate Vastu Score (mock for now, would be based on a saved vastu report)
        const vastuScore = 78; // Placeholder

        // Get Sustainability Score
        const sustainabilityScore = project.sustainabilityReport?.score || 0;

        // Calculate material distribution from BoQ
        const materialDistribution = (project.billOfQuantities?.lineItems || [])
            .filter((item) => ['Brickwork', 'Structural Concrete', 'Reinforcement Steel'].includes(item.item))
            .map((item) => ({ name: item.item, value: item.quantity }));
        
        // Aggregate AI Credit Usage
        const creditUsage = (project.aiCreditUsage || []).reduce((acc, usage) => {
            const existing = acc.find(item => item.name === usage.tool);
            if (existing) {
                existing.cost += usage.cost;
            } else {
                acc.push({ name: usage.tool, cost: usage.cost });
            }
            return acc;
        }, []);

        res.json({
            vastuScore,
            sustainabilityScore,
            materialDistribution,
            creditUsage,
        });

    } catch (error) {
        next(error);
    }
};

// --- DWG/DXF Import/Export ---
export const importDwg = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('No DWG/DXF file uploaded.', 400));
        }
        const parser = new DxfParser();
        const dxf = parser.parseSync(req.file.buffer.toString('utf-8'));
        
        if (!dxf || !dxf.entities) {
             return next(new AppError('Could not parse the DXF file. Ensure it is a valid DXF format.', 400));
        }

        const walls = [];
        for (const entity of dxf.entities) {
            if (entity.type === 'LINE') {
                walls.push({
                    id: generateId('wall_imp'),
                    x1: entity.vertices[0].x,
                    y1: entity.vertices[0].y,
                    x2: entity.vertices[1].x,
                    y2: entity.vertices[1].y,
                    thickness: 10, // Default thickness
                    height: 240, // Default height
                    layerId: 'layer_default'
                });
            }
        }

        const projectData = {
            name: req.file.originalname.replace(/\.(dwg|dxf)$/i, ''),
            projectType: 'building',
            levels: [{
                id: generateId('level_imp'),
                name: 'Imported Level',
                elevation: 0,
                walls: walls,
                rooms: [],
                placements: [],
                placedModels: [],
                dimensionLines: [],
                comments: [],
                suggestedFurniture: [],
                plumbingLayout: [],
                electricalLayout: null,
                hvacLayout: null,
                generatedRenders: {},
                drawingSet: null,
                layers: [{ id: 'layer_default', name: 'Default', isVisible: true, isLocked: false }],
                activeLayerId: 'layer_default',
                zones: [],
                infrastructure: [],
            }],
            planNorthDirection: 'N',
            propertyLines: [],
            terrainMesh: null
        };
        
        res.status(200).json(projectData);

    } catch (error) {
        console.error("DXF import error:", error);
        next(new AppError('Error processing DXF file. It might be corrupted or an unsupported version.', 500));
    }
};

export const exportDwg = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.user;
    
    const project = await Project.findOne({ 
        _id: projectId,
        $or: [{ userId: userId }, { 'collaborators.userId': userId }],
    });
    
    if (!project) {
      return next(new AppError("Project not found or you don't have permission.", 404));
    }
    
    const d = new DxfWriter();
    d.addLayer('Walls', DxfWriter.colors.White);
    d.addLayer('Openings', DxfWriter.colors.Cyan);
    d.setActiveLayer('Walls');

    project.levels.forEach(level => {
        level.walls.forEach(wall => {
            d.drawLine(wall.x1, wall.y1, wall.x2, wall.y2);
        });
        
        d.setActiveLayer('Openings');
        level.placements.forEach(p => {
            const wall = level.walls.find(w => w.id === p.wallId);
            if (!wall) return;
            const wallVec = { x: wall.x2 - wall.x1, y: wall.y2 - wall.y1 };
            const wallLen = Math.hypot(wallVec.x, wallVec.y);
            if (wallLen === 0) return;
            
            const startRatio = p.positionRatio - (p.width / 2 / wallLen);
            const endRatio = p.positionRatio + (p.width / 2 / wallLen);

            const p1x = wall.x1 + wallVec.x * startRatio;
            const p1y = wall.y1 + wallVec.y * startRatio;
            const p2x = wall.x1 + wallVec.x * endRatio;
            const p2y = wall.y1 + wallVec.y * endRatio;
            
            d.drawLine(p1x, p1y, p2x, p2y);
        });
    });

    res.header('Content-Type', 'application/dxf');
    res.header('Content-Disposition', `attachment; filename="${project.name.replace(/\s+/g, '_')}.dxf"`);
    res.send(d.toDxfString());

  } catch (error) {
    next(error);
  }
};


// --- Asset Management for Project Hub ---
const addAsset = async (req, res, next, assetType) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.user;
        const assetData = req.body;

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ userId: userId }, { 'collaborators': { $elemMatch: { userId: userId, role: 'editor' } } }]
        });
        if (!project) return next(new AppError('Project not found or access denied.', 404));

        project[assetType].push(assetData);
        await project.save();
        res.status(201).json(project[assetType]);
    } catch (error) {
        next(error);
    }
};

const deleteAsset = async (req, res, next, assetType) => {
     try {
        const { projectId, assetId } = req.params;
        const { userId } = req.user;

        const project = await Project.findOne({
            _id: projectId,
            $or: [{ userId: userId }, { 'collaborators': { $elemMatch: { userId: userId, role: 'editor' } } }]
        });
        if (!project) return next(new AppError('Project not found or access denied.', 404));
        
        project[assetType].pull({ _id: assetId });
        await project.save();
        res.status(200).json(project[assetType]);
    } catch (error) {
        next(error);
    }
};

export const addDocument = (req, res, next) => addAsset(req, res, next, 'generatedDocuments');
export const deleteDocument = (req, res, next) => deleteAsset(req, res, next, 'generatedDocuments');
export const addRender = (req, res, next) => addAsset(req, res, next, 'generatedRenders');
export const deleteRender = (req, res, next) => deleteAsset(req, res, next, 'generatedRenders');


// --- Collaborator Management ---
export const inviteCollaborator = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { email, role = 'editor' } = req.body;
        const { userId: inviterId } = req.user;
        
        const inviter = await User.findById(inviterId).select('name email');
        const project = await Project.findById(projectId);
        if (!project || project.userId.toString() !== inviterId) {
            return next(new AppError("Project not found or you are not the owner.", 404));
        }

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) {
            return next(new AppError(`User with email ${email} not found.`, 404));
        }

        if (userToInvite._id.toString() === project.userId.toString() || project.collaborators.some(c => c.userId.toString() === userToInvite._id.toString())) {
            return next(new AppError("User is already a member of this project.", 409));
        }

        project.collaborators.push({ userId: userToInvite._id, role });
        await project.save();
        
        // NEW: Send email notification
        try {
            await emailService.sendCollaborationInviteEmail(
                userToInvite.email,
                inviter.name || inviter.email,
                project.name
            );
        } catch (emailError) {
             console.error(`[COLLAB] Invite email failed for ${userToInvite.email}:`, emailError);
             // Do not block the process if email fails
        }
        
        const populatedProject = await project.populate('collaborators.userId', 'name email profileImageUrl');
        res.status(200).json({
            message: `${userToInvite.name || userToInvite.email} has been added to the project.`,
            collaborators: populatedProject.collaborators.map(c => c.toObject())
        });
    } catch (error) {
        next(error);
    }
};

export const removeCollaborator = async (req, res, next) => {
    try {
        const { projectId, collaboratorId } = req.params;
        const { userId: removerId } = req.user;
        const project = await Project.findById(projectId);
        if (!project || project.userId.toString() !== removerId) {
            return next(new AppError("Project not found or you are not the owner.", 404));
        }
        project.collaborators = project.collaborators.filter(c => c.userId.toString() !== collaboratorId);
        await project.save();
        const populatedProject = await project.populate('collaborators.userId', 'name email profileImageUrl');
        res.status(200).json({
            message: 'Collaborator removed successfully.',
            collaborators: populatedProject.collaborators.map(c => c.toObject())
        });
    } catch (error) {
        next(error);
    }
};

export const getCollaborators = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.user;
        const project = await Project.findOne({
            _id: projectId,
            $or: [{ userId: userId }, { 'collaborators.userId': userId }],
        }).populate('collaborators.userId', 'name email profileImageUrl');
        if (!project) return next(new AppError("Project not found or access denied.", 404));
        res.json(project.collaborators.map(c => c.toObject()));
    } catch (error) {
        next(error);
    }
};

// --- MARKETPLACE CONTROLLERS ---

export const getMarketplaceProjects = async (req, res, next) => {
    try {
        const templates = await Project.find({ isForSale: true })
            .sort({ 'marketplace.numPurchases': -1, updatedAt: -1 })
            .populate('userId', 'name profileImageUrl')
            .select('name projectType previewImageUrl userId marketplace');
        res.json(templates.map(t => t.toObject()));
    } catch (error) {
        next(error);
    }
};

export const publishProjectToMarketplace = async (req, res, next) => {
    const { projectId } = req.params;
    const { userId } = req.user;
    const { price, description, tags } = req.body;

    if (!price || price < 0) {
        return next(new AppError("A valid price is required.", 400));
    }

    try {
        const project = await Project.findOne({ _id: projectId, userId });
        if (!project) {
            return next(new AppError("Project not found or you are not the owner.", 404));
        }
        
        project.isForSale = true;
        project.isPublic = true; // For-sale projects must be public
        project.marketplace = { price, description, tags, numPurchases: 0 };
        
        if (!project.previewImageUrl) {
            project.previewImageUrl = project.generatedRenders?.[0]?.url || null;
        }

        await project.save();
        res.json({ message: "Project successfully published to the marketplace!", project: project.toObject() });
    } catch (error) {
        next(error);
    }
};

export const buyMarketplaceProject = async (req, res, next) => {
    const { projectId } = req.params;
    const { userId: buyerId } = req.user;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const templateProject = await Project.findById(projectId).populate('userId').session(session);
        if (!templateProject || !templateProject.isForSale) {
            throw new AppError("This template is not for sale.", 404);
        }
        
        const price = templateProject.marketplace.price;
        const seller = templateProject.userId;
        const buyer = await User.findById(buyerId).session(session);

        if (seller._id.toString() === buyer._id.toString()) {
            throw new AppError("You cannot buy your own template.", 400);
        }
        if (buyer.credits < price) {
            throw new AppError("Insufficient credits to purchase this template.", 402);
        }

        // Transactions
        const earnings = Math.floor(price * 0.9); // 10% platform fee
        
        buyer.credits -= price;
        seller.marketplaceEarnings = (seller.marketplaceEarnings || 0) + earnings;
        seller.credits += earnings; // Also add to seller's credit balance
        templateProject.marketplace.numPurchases = (templateProject.marketplace.numPurchases || 0) + 1;
        
        // Create a copy for the buyer
        const newProjectData = templateProject.toObject();
        delete newProjectData._id;
        delete newProjectData.id;
        newProjectData.userId = buyerId;
        newProjectData.name = `Copy of ${templateProject.name}`;
        newProjectData.isForSale = false;
        delete newProjectData.marketplace;
        newProjectData.collaborators = [];
        newProjectData.version = 1;
        newProjectData.createdAt = new Date();
        newProjectData.updatedAt = new Date();

        const [newProject] = await Project.create([newProjectData], { session });
        await buyer.save({ session });
        await seller.save({ session });
        await templateProject.save({ session });
        
        // Log Transactions
        await Transaction.create([{
            userId: buyerId,
            type: 'marketplace_purchase',
            amount: -price,
            description: `Purchased template: ${templateProject.name}`,
            relatedId: templateProject.id
        }, {
            userId: seller._id,
            type: 'marketplace_sale',
            amount: earnings,
            description: `Sold template: ${templateProject.name}`,
            relatedId: templateProject.id
        }], { session });


        await session.commitTransaction();
        res.json({ message: "Template purchased successfully! It has been added to your projects.", newProjectId: newProject._id });
        
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// NEW: Real Estate Exchange Controllers
export const getExchangeListings = async (req, res, next) => {
    try {
        const listings = await Project.find({ 'tokenization.isTokenized': true })
            .sort({ updatedAt: -1 })
            .populate('userId', 'name profileImageUrl id')
            .select('name projectType previewImageUrl userId tokenization');
        res.json(listings.map(p => p.toObject()));
    } catch (error) {
        next(error);
    }
};

export const tokenizeProject = async (req, res, next) => {
    const { projectId } = req.params;
    const { userId } = req.user;
    const { totalTokens, pricePerToken, offeringDescription } = req.body;

    if (!totalTokens || !pricePerToken || !offeringDescription) {
        return next(new AppError("Tokenization details are required.", 400));
    }

    try {
        const project = await Project.findOne({ _id: projectId, userId });
        if (!project) {
            return next(new AppError("Project not found or you are not the owner.", 404));
        }

        project.tokenization = {
            isTokenized: true,
            totalTokens,
            pricePerToken,
            offeringDescription,
        };

        if (!project.previewImageUrl) {
            project.previewImageUrl = project.generatedRenders?.[0]?.url || null;
        }

        await project.save();
        res.json({ message: "Project successfully tokenized and listed on the exchange!", project: project.toObject() });
    } catch (error) {
        next(error);
    }
};


export const updateProjectMeta = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { projectId } = req.params;
        const { status, budget, tasks } = req.body;
        if (!mongoose.Types.ObjectId.isValid(projectId)) { return next(new AppError('Invalid project ID format.', 400)); }
        const project = await Project.findOne({ _id: projectId, $or: [{ userId }, { 'collaborators.userId': userId }] });
        if (!project) return next(new AppError('Project not found or access denied.', 404));
        if (status) project.status = status;
        if (budget) project.budget = budget;
        if (tasks) project.tasks = tasks;
        const updatedProject = await project.save();
        res.json({ project: updatedProject.toObject() });
    } catch (error) {
        next(error);
    }
};

export const manageClientPortal = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { projectId } = req.params;
        const { enable } = req.body;
        if (!mongoose.Types.ObjectId.isValid(projectId)) { return next(new AppError('Invalid project ID format.', 400)); }
        const project = await Project.findOne({ _id: projectId, userId });
        if (!project) return next(new AppError('Project not found or access denied.', 404));
        if (enable) {
            if (!project.clientAccess || !project.clientAccess.shareableLink) {
                const shareableLink = crypto.randomBytes(16).toString('hex');
                project.clientAccess = { isEnabled: true, shareableLink };
            } else {
                project.clientAccess.isEnabled = true;
            }
        } else {
            if (project.clientAccess) {
                project.clientAccess.isEnabled = false;
            }
        }
        const updatedProject = await project.save();
        res.json({ project: updatedProject.toObject() });
    } catch (error) {
        next(error);
    }
};

export const getPublicProject = async (req, res, next) => {
    try {
        const { shareableLink } = req.params;
        const project = await Project.findOne({
            'clientAccess.shareableLink': shareableLink,
            'clientAccess.isEnabled': true
        });
        if (!project) return next(new AppError('Project not found or access has been disabled.', 404));
        const publicProjectData = {
            name: project.name,
            levels: project.levels.map(level => ({
                name: level.name,
                elevation: level.elevation,
                walls: level.walls,
                rooms: level.rooms,
                placements: level.placements,
                placedModels: level.placedModels,
            })),
            planNorthDirection: project.planNorthDirection,
            propertyLines: project.propertyLines,
            terrainMesh: project.terrainMesh,
        };
        res.json({ project: publicProjectData });
    } catch (error) {
        next(error);
    }
};

export const generateArchitectsFolio = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { projectId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(projectId)) { return next(new AppError('Invalid project ID format.', 400)); }
        const project = await Project.findOne({ _id: projectId, userId });
        if (!project) return next(new AppError('Project not found or access denied.', 404));
        const folioNarrative = await generateFolioNarrative(project.toObject(), userId);
        const folioData = {
            title: folioNarrative.title,
            narrative: folioNarrative.narrative,
            shareableLink: project.folio?.shareableLink || crypto.randomBytes(16).toString('hex'),
            isEnabled: true,
        };
        project.folio = folioData;
        const updatedProject = await project.save();
        res.json({ project: updatedProject.toObject() });
    } catch (error) {
        console.error("Error generating Architect's Folio:", error);
        next(error);
    }
};

export const getPublicFolio = async (req, res, next) => {
    try {
        const { shareableLink } = req.params;
        const project = await Project.findOne({
            'folio.shareableLink': shareableLink,
            'folio.isEnabled': true
        });
        if (!project) return next(new AppError("Architect's Folio not found or access has been disabled.", 404));
        res.json({ project: project.toObject() });
    } catch (error) {
        next(error);
    }
};

// NEW: Holocron Controllers
export const generateHolocron = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { projectId } = req.params;
        const project = await Project.findOne({ _id: projectId, userId });
        if (!project) return next(new AppError('Project not found or access denied.', 404));
        
        if (!project.holocron || !project.holocron.shareableLink) {
             project.holocron = { isEnabled: true, shareableLink: crypto.randomBytes(16).toString('hex'), hotspots: [] };
        } else {
             project.holocron.isEnabled = true;
        }
        
        await project.save();
        res.json({ project: project.toObject() });
    } catch(error) {
        next(error);
    }
}

export const getPublicHolocron = async (req, res, next) => {
    try {
        const { shareableLink } = req.params;
        const project = await Project.findOne({
            'holocron.shareableLink': shareableLink,
            'holocron.isEnabled': true
        }).select('name levels planNorthDirection propertyLines terrainMesh holocron');
        
        if (!project || !project.holocron) {
            return next(new AppError('Holocron not found or access has been disabled.', 404));
        }
        
        // Structure the data specifically for the Holocron presentation, using saved hotspots
        const holocronData = {
            projectName: project.name,
            levels: project.levels,
            planNorthDirection: project.planNorthDirection,
            propertyLines: project.propertyLines,
            terrainMesh: project.terrainMesh,
            hotspots: project.holocron.hotspots || []
        };
        
        res.json(holocronData);
        
    } catch(error) {
        next(error);
    }
}

export const toggleProjectPublicStatus = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.user;
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new AppError('Invalid project ID format.', 400));
        }
        const project = await Project.findOne({ _id: projectId, userId });
        if (!project) {
            return next(new AppError('Project not found or you are not the owner.', 404));
        }

        project.isPublic = !project.isPublic;
        
        // If making public and no preview image, set one from renders.
        if (project.isPublic && !project.previewImageUrl) {
            project.previewImageUrl = project.generatedRenders?.[0]?.url || null;
        }

        const updatedProject = await project.save();
        res.json(updatedProject.toObject());

    } catch (error) {
        next(error);
    }
};

// NEW: Digital Twin Controller
export const getDigitalTwinData = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId).select('levels');
        if (!project) {
            return next(new AppError('Project not found.', 404));
        }

        let totalPowerDraw = 0;
        let peakStressFactor = 0;
        let totalOccupancy = 0;
        const energyUsage = [];
        const structuralStress = [];
        const occupancy = [];

        // This is a *simulation*. In a real system, this data would come from IoT sensors.
        (project.levels || []).forEach(level => {
            (level.rooms || []).forEach(room => {
                let power = (room.calculatedArea || 100) * 0.05; // Base power
                if (room.type.toLowerCase().includes('kitchen')) power *= 3;
                if (room.type.toLowerCase().includes('living')) power *= 1.5;
                totalPowerDraw += power;
                energyUsage.push({ roomId: room.id, powerDraw: power });

                const people = Math.round(Math.random() * ((room.calculatedArea || 100) / 100));
                totalOccupancy += people;
                occupancy.push({ roomId: room.id, count: people });
            });
            (level.walls || []).forEach(wall => {
                let stress = 0.1 + (level.elevation === 0 ? 0.2 : 0); // Ground floor has more stress
                stress += Math.random() * 0.1;
                if (stress > peakStressFactor) peakStressFactor = stress;
                structuralStress.push({ wallId: wall.id, stressFactor: stress });
            });
        });
        
        res.json({
            totalPowerDraw,
            peakStressFactor,
            totalOccupancy,
            energyUsage,
            structuralStress,
            occupancy,
        });

    } catch (error) {
        next(error);
    }
};
