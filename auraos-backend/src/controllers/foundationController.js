
// src/controllers/foundationController.js
import Submission from '../models/Submission.js';
import Project from '../models/Project.js';
import AppError from '../utils/AppError.js';
import { runAdjudicationEngine } from './geminiController.js';

export const createSubmission = async (req, res, next) => {
    const { userId } = req.user;
    const { projectId, proposal } = req.body;

    if (!projectId || !proposal) {
        return next(new AppError('Project ID and a written proposal are required.', 400));
    }

    try {
        const project = await Project.findOne({ _id: projectId, userId });
        if (!project) {
            return next(new AppError('You can only submit your own projects.', 403));
        }

        const existingSubmission = await Submission.findOne({ projectId });
        if (existingSubmission) {
            return next(new AppError('This project has already been submitted to The Vaarahi Prize.', 409));
        }

        const newSubmission = new Submission({
            userId,
            projectId,
            proposal
        });

        // In a future version, this is where you would trigger the AI adjudication
        // to populate the `aiScores` field automatically.
        
        await newSubmission.save();
        
        res.status(201).json({ message: 'Your project has been successfully submitted to The Vaarahi Prize. Good luck!' });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(new AppError(error.message, 400));
        }
        next(error);
    }
};

// Controller for the owner to view submissions
export const getSubmissions = async (req, res, next) => {
    try {
        const submissions = await Submission.find({})
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .populate('projectId', 'name projectType previewImageUrl');

        res.json(submissions.map(s => s.toObject()));
    } catch (error) {
        next(error);
    }
};

// NEW: Controller to trigger AI adjudication
export const adjudicateSubmission = async (req, res, next) => {
    try {
        const { submissionId } = req.params;
        
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return next(new AppError('Submission not found.', 404));
        }

        submission.status = 'under_review';
        await submission.save();
        
        const project = await Project.findById(submission.projectId);
        if (!project) {
            return next(new AppError('Associated project not found.', 404));
        }

        // Run the adjudication AI
        const report = await runAdjudicationEngine(project, submission.proposal);

        // Save the report and update the status
        submission.adjudicationReport = report;
        submission.status = 'adjudicated';
        await submission.save();

        res.json(submission.toObject());

    } catch (error) {
        // If adjudication fails, revert status
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId);
        if (submission) {
            submission.status = 'submitted';
            await submission.save();
        }
        next(error);
    }
};
