
// auraos-backend/src/controllers/communityController.js
import Project from '../models/Project.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

// Get all projects that are marked as public
export const getPublicProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ isPublic: true })
            .sort({ updatedAt: -1 })
            .populate('userId', 'name profileImageUrl id') // Only populate necessary public user info
            .select('name projectType previewImageUrl userId');

        res.json(projects.map(p => p.toObject()));
    } catch (error) {
        next(error);
    }
};

// NEW: Get the single featured project for the dashboard showcase
export const getFeaturedProject = async (req, res, next) => {
    try {
        // In a real scenario, this might be a manually flagged project.
        // For now, we'll feature the most recently updated public project with an enabled Folio.
        const featuredProject = await Project.findOne({ isPublic: true, 'folio.isEnabled': true })
            .sort({ updatedAt: -1 })
            .populate('userId', 'name profileImageUrl id'); // Populate all necessary details

        if (!featuredProject) {
            return next(new AppError('No featured project available at this time.', 404));
        }

        res.json(featuredProject.toObject());
    } catch (error) {
        next(error);
    }
};


// Get a single user's public profile if it's enabled
export const getPublicUserProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next(new AppError('Invalid user ID format.', 400));
        }

        const user = await User.findOne({ _id: userId, isProfilePublic: true })
            .select('name profession bio profileImageUrl portfolioUrl linkedInUrl');
            
        if (!user) {
            return next(new AppError('User not found or their profile is private.', 404));
        }

        const userProjects = await Project.find({ userId: userId, isPublic: true })
            .sort({ updatedAt: -1 })
            .select('name projectType previewImageUrl');

        res.json({
            user: user.toObject(),
            projects: userProjects.map(p => p.toObject()),
        });

    } catch (error) {
        next(error);
    }
};
