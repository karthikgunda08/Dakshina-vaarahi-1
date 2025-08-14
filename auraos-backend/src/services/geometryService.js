
// src/services/geometryService.js
import Project from '../models/Project.js';
import AppError from '../utils/AppError.js';

const generateId = (prefix) => `${prefix}_${new Date().getTime()}_${Math.random().toString(36).substring(2, 7)}`;

/**
 * Applies a structured command from the AI to the project data.
 * @param {string} projectId - The ID of the project to modify.
 * @param {object} command - The command object from the AI.
 * @returns {Promise<object>} The updated project data subset.
 */
export const applyCommand = async (projectId, command) => {
    const project = await Project.findById(projectId);
    if (!project) {
        throw new AppError('Project not found', 404);
    }

    const { action, payload } = command;
    const { levelIndex } = payload;
    const activeLevel = project.levels[levelIndex];

    if (!activeLevel) {
        throw new AppError(`Level at index ${levelIndex} not found.`, 404);
    }

    switch (action) {
        case 'ADD_WALL': {
            const { x1, y1, x2, y2, thickness = 10, height = 240 } = payload;
            const newWall = { id: generateId('wall_ai'), x1, y1, x2, y2, thickness, height, layerId: activeLevel.activeLayerId || 'layer_default' };
            activeLevel.walls.push(newWall);
            break;
        }
            
        case 'MODIFY_WALL': {
            const { wallId, newProperties } = payload;
            const wall = activeLevel.walls.find(w => w.id === wallId);
            if(wall) {
                Object.assign(wall, newProperties);
            } else {
                throw new AppError(`Wall with ID ${wallId} not found on level ${levelIndex}.`, 404);
            }
            break;
        }

        case 'DELETE_WALL': {
            const { wallId } = payload;
            const initialLength = activeLevel.walls.length;
            activeLevel.walls = activeLevel.walls.filter(w => w.id !== wallId);
            if (activeLevel.walls.length === initialLength) {
                 throw new AppError(`Wall with ID ${wallId} not found for deletion.`, 404);
            }
            break;
        }

        case 'ADD_WINDOW': {
            const { wallId, positionRatio, width, height } = payload;
            const newPlacement = {
                id: generateId('window_ai'),
                wallId,
                type: 'window',
                positionRatio,
                width,
                height,
                layerId: activeLevel.activeLayerId || 'layer_default'
            };
            activeLevel.placements.push(newPlacement);
            break;
        }
        
        case 'MOVE_FURNITURE': {
            const { modelId, newPosition } = payload;
            const model = activeLevel.placedModels.find(m => m.id === modelId);
            if (model) {
                model.x = newPosition.x;
                model.y = newPosition.y;
            } else {
                throw new AppError(`Furniture with ID ${modelId} not found.`, 404);
            }
            break;
        }
        
        default:
            console.warn(`Unknown geometry command action: ${action}`);
            // Return unmodified data if action is not recognized
            return {
                levels: project.levels,
                zones: project.zones,
                infrastructure: project.infrastructure
            };
    }

    // Mark levels as modified to ensure save, since it's a mixed-type schema
    project.markModified('levels');
    await project.save();
    
    // Return the updated part of the project
    return {
        levels: project.levels,
        zones: project.zones,
        infrastructure: project.infrastructure
    };
};
