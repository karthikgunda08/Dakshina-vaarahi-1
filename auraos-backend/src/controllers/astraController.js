
// src/controllers/astraController.js
// This is a placeholder for a complex supply chain management system.
// In a real-world scenario, this would involve intricate logic for RFQs, supplier matching, etc.

import Supplier from '../models/Supplier.js';
import Quote from '../models/Quote.js';
import Project from '../models/Project.js'; // NEW
import AppError from '../utils/AppError.js'; // NEW

// Mock function to get suppliers, in reality this would be a complex search
export const findSuppliers = async (req, res, next) => {
    try {
        const { materialCategory, location } = req.query;
        // Basic filter for now. A real implementation would use geospatial queries.
        const suppliers = await Supplier.find({ materialCategory: materialCategory || 'Structural Concrete' }).limit(10);
        res.json(suppliers.map(s => s.toObject()));
    } catch (error) {
        next(error);
    }
};

// Mock function to get quotes
export const getQuotesForProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const quotes = await Quote.find({ projectId }).populate('supplierId');
        res.json(quotes.map(q => q.toObject()));
    } catch (error) {
        next(error);
    }
};

// NEW: Create RFQ and generate mock quotes
export const createRfqForProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { items } = req.body;

        if (!items || !Array.isArray(items)) {
            return next(new AppError('BoQ items are required to create an RFQ.', 400));
        }

        // Simulate finding suppliers for a few key materials
        const keyMaterials = ['Structural Concrete', 'Reinforcement Steel', 'Brickwork'];
        const suppliers = await Supplier.find({ materialCategory: { $in: keyMaterials } });

        if (suppliers.length === 0) {
            // In a real app, you might seed suppliers first. For now, we'll return a message.
            return res.json({ message: "RFQ received. No suppliers currently available for these materials in the network." });
        }

        const quotesToCreate = [];
        for (const item of items) {
            if (keyMaterials.includes(item.item)) {
                // Create a mock quote from a random supplier
                const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
                quotesToCreate.push({
                    projectId,
                    supplierId: randomSupplier._id,
                    materialName: item.item,
                    quantity: item.quantity,
                    unit: item.unit,
                    // Simulate a price, e.g., random value around a base price
                    price: Math.round(item.quantity * (5000 + Math.random() * 2000)),
                    status: 'pending'
                });
            }
        }
        
        if (quotesToCreate.length > 0) {
            await Quote.insertMany(quotesToCreate);
        }

        res.status(201).json({ message: `RFQ sent! ${quotesToCreate.length} quotes are being generated on the Astra Network.` });
    } catch (error) {
        next(error);
    }
};

// NEW: Get all quotes for the logged-in user's projects
export const getUserQuotes = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const userProjects = await Project.find({ userId }).select('_id');
        const projectIds = userProjects.map(p => p._id);

        const quotes = await Quote.find({ projectId: { $in: projectIds } })
            .populate('supplierId', 'name')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 });
            
        res.json(quotes.map(q => q.toObject()));
    } catch (error) {
        next(error);
    }
};
