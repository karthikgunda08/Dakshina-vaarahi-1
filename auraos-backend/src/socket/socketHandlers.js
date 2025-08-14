// src/socket/socketHandlers.js
import { processAiChatCommand, runSamaranganEngine } from '../controllers/geminiController.js';
import * as geometryService from '../services/geometryService.js';
import Project from '../models/Project.js'; 

const initializeSocketHandlers = (io) => {
    // A map to store active intervals for each project
    const projectIntervals = new Map();

    const cleanupProjectInterval = (projectId) => {
        const room = io.sockets.adapter.rooms.get(projectId);
        if (!room || room.size === 0) {
            if (projectIntervals.has(projectId)) {
                clearInterval(projectIntervals.get(projectId));
                projectIntervals.delete(projectId);
                console.log(`Stopped IoT simulator for empty project room ${projectId}`);
            }
        }
    };

    io.on('connection', (socket) => {
        console.log(`⚡: User connected ${socket.id} (${socket.user.email})`);
        
        socket.on('join_project', async (projectId) => {
            socket.join(projectId);
            console.log(`User ${socket.user.email} joined project room ${projectId}`);
            
            try {
                const project = await Project.findById(projectId).select('chatHistory levels');
                if (project) {
                    if (project.chatHistory) {
                        socket.emit('load_chat_history', project.chatHistory);
                    }
                    if (!projectIntervals.has(projectId)) {
                        const wallIds = project.levels.flatMap(l => l.walls.map(w => w.id));
                        if (wallIds.length > 0) {
                            const intervalId = setInterval(() => {
                                const randomWallId = wallIds[Math.floor(Math.random() * wallIds.length)];
                                const stressFactor = 0.05 + Math.random() * 0.75; 
                                io.to(projectId).emit('iot_data_update', {
                                    wallId: randomWallId,
                                    stressFactor: stressFactor
                                });
                            }, 3500);
                            projectIntervals.set(projectId, intervalId);
                            console.log(`Started IoT simulator for project ${projectId}`);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error fetching project data for room ${projectId}:`, error);
            }
        });

        socket.on('leave_project', (projectId) => {
            socket.leave(projectId);
            console.log(`User ${socket.user.email} left project room ${projectId}`);
            cleanupProjectInterval(projectId);
        });


        socket.on('chat_message', async ({ projectId, message }) => {
            const project = await Project.findById(projectId);
            if (!project) {
                return socket.emit('error_message', 'Project not found.');
            }
            
            const userMessage = { userId: socket.user.userId, userName: socket.user.name || socket.user.email.split('@')[0], text: message, isAI: false, timestamp: new Date().toISOString() };
            project.chatHistory.push(userMessage);
            io.to(projectId).emit('chat_message', userMessage);
            
            if (message.toLowerCase().startsWith('@aura')) {
                const commandText = message.substring(5).trim();
                const samaranganKeywords = ['make', 'add', 'increase', 'decrease', 'enlarge', 'move', 'shift', 'change', 'design', 'create'];
                const isSamaranganCommand = samaranganKeywords.some(kw => commandText.toLowerCase().startsWith(kw));

                try {
                    if (isSamaranganCommand) {
                        // Route to Samarangan Engine for complex design changes
                        const solutions = await runSamaranganEngine(projectId, commandText, project.toObject());
                        io.to(projectId).emit('samarangan_solutions', solutions);
                        
                        const aiMessage = { userName: 'Aura AI', text: `I have proposed ${solutions.length} solutions for your request. Please review them in the Samarangan tool panel.`, isAI: true, timestamp: new Date().toISOString() };
                        project.chatHistory.push(aiMessage);
                        io.to(projectId).emit('chat_message', aiMessage);

                    } else {
                        // Route to simple command processor
                        const command = await processAiChatCommand(message, projectId);
                        const aiMessage = { userName: 'Aura AI', text: command.narrative || `Executing: ${command.action}`, isAI: true, timestamp: new Date().toISOString() };
                        
                        if (command && command.action !== 'INFO_ONLY') {
                            const updatedProjectData = await geometryService.applyCommand(projectId, command);
                            project.chatHistory.push(aiMessage);
                            io.to(projectId).emit('chat_message', aiMessage);
                            io.to(projectId).emit('geometry_update', updatedProjectData);
                        } else {
                            project.chatHistory.push(aiMessage);
                            io.to(projectId).emit('chat_message', aiMessage);
                        }
                    }
                } catch (error) {
                    console.error("AI command processing error:", error);
                    const errorMessage = { userName: 'Aura AI', text: `Aura AI Error: ${error.message}`, isAI: true, timestamp: new Date().toISOString() };
                    project.chatHistory.push(errorMessage);
                    io.to(projectId).emit('chat_message', errorMessage);
                }
            }
             await project.save();
        });
        
        socket.on('cursor_move', ({ projectId, position }) => {
            socket.to(projectId).emit('cursor_update', {
                userId: socket.user.userId,
                userName: socket.user.name || socket.user.email.split('@')[0],
                position
            });
        });

        socket.on('object_selection', ({ projectId, selection }) => {
            socket.to(projectId).emit('selection_update', {
                userId: socket.user.userId,
                selection
            });
        });

        socket.on('geometry_update', async ({ projectId, updatedProjectData }) => {
            try {
                const project = await Project.findById(projectId);
                if (project) {
                    project.levels = updatedProjectData.levels;
                    project.zones = updatedProjectData.zones;
                    project.infrastructure = updatedProjectData.infrastructure;
                    await project.save();
                    socket.to(projectId).emit('geometry_update', updatedProjectData);
                }
            } catch (error) {
                 console.error(`Error saving geometry update for project ${projectId}:`, error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔥: User disconnected ${socket.id}`);
            socket.rooms.forEach(room => {
                if (room !== socket.id) {
                    cleanupProjectInterval(room);
                }
            });
        });
    });
};

export default initializeSocketHandlers;