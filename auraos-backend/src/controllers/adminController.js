// src/controllers/adminController.js
import User from '../models/User.js';
import Project from '../models/Project.js';
import Payment from '../models/Payment.js';
import Feedback from '../models/Feedback.js';

export const getKpiData = async (req, res, next) => {
    try {
        const [totalUsers, totalProjects, totalPayments, totalCreditsSold] = await Promise.all([
            User.countDocuments(),
            Project.countDocuments(),
            Payment.find({ status: 'captured' }).select('amount currency'),
            Payment.aggregate([
                { $match: { status: 'captured' } },
                { $group: { _id: "$creditPackId", count: { $sum: 1 } } }
            ])
        ]);

        const totalRevenue = totalPayments.reduce((acc, payment) => acc + payment.amount, 0) / 100;

        const creditsSoldData = totalCreditsSold.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        res.json({ totalUsers, totalProjects, totalRevenue, creditsSold: creditsSoldData });

    } catch (error) {
        console.error("Error fetching KPI data:", error);
        next(error);
    }
};

// NEW: Controller for Chart Data
export const getKpiChartData = async (req, res, next) => {
    try {
        // In a real application, this data would come from a more complex aggregation
        // of user signups and payments over time. Here we simulate it.
        const data = [
            { name: 'Jan', users: 40, revenue: 24000 },
            { name: 'Feb', users: 30, revenue: 13980 },
            { name: 'Mar', users: 50, revenue: 98000 },
            { name: 'Apr', users: 47, revenue: 39080 },
            { name: 'May', users: 68, revenue: 48000 },
            { name: 'Jun', users: 59, revenue: 38000 },
            { name: 'Jul', users: 84, revenue: 43000 },
        ];
        res.json(data);
    } catch (error) {
        next(error);
    }
}

export const getAllProjectsForOwner = async (req, res, next) => {
    try {
        const projects = await Project.find({})
            .sort({ updatedAt: -1 })
            .populate('userId', 'email name')
            .select('name updatedAt userId folio projectType');
        res.json(projects.map(p => p.toObject()));
    } catch(error) {
         next(error);
    }
}

export const getAllUsersForOwner = async (req, res, next) => {
     try {
        const users = await User.find({})
            .sort({ createdAt: -1 })
            .select('email name role credits createdAt');
        res.json(users.map(u => u.toObject()));
    } catch(error) {
         next(error);
    }
}

export const getAllFeedback = async (req, res, next) => {
    try {
        const feedback = await Feedback.find({})
            .sort({ createdAt: -1 })
            .populate('userId', 'email name');
        res.json(feedback.map(f => f.toObject()));
    } catch(error) {
        next(error);
    }
};

// NEW: Controller for Brahman Protocol Strategic Insights
export const getStrategicInsights = async (req, res, next) => {
    try {
        // In a real-world scenario, this would involve a complex aggregation pipeline
        // across the 'projects' collection to identify trends.
        // For this demonstration, we will simulate the findings.
        const insights = [
            {
                id: 'insight_1',
                finding: 'Cost Overrun on Concrete',
                observation: 'Projects in dense urban areas (e.g., Mumbai, Delhi) show a 22% higher actual cost for "Structural Concrete" than estimated in initial BoQs.',
                hypothesis: 'This is likely due to logistical challenges (traffic, storage) and higher local material costs not accounted for in preliminary estimates.',
                actionable_intelligence: 'Adjusting the cost estimation model for BoQ generation to include a location-based multiplier for key materials in Tier-1 cities.'
            },
            {
                id: 'insight_2',
                finding: 'High Marketplace Success for Compact Designs',
                observation: 'Project templates under 1500 sq. ft. have a 3x higher purchase rate on the marketplace compared to larger designs.',
                hypothesis: 'There is a strong market demand for efficient, well-designed small-family homes.',
                actionable_intelligence: 'Prioritizing smaller, optimized Vastu-compliant home designs in featured marketplace content and social media posts.'
            },
            {
                id: 'insight_3',
                finding: 'Vastu Compliance Correlation',
                observation: 'Projects with a Vastu score above 85 have a 40% higher rate of being marked "completed" by users vs. being abandoned.',
                hypothesis: 'Designs that adhere to Vastu principles lead to higher client satisfaction and project completion.',
                actionable_intelligence: 'Strengthening the Vastu compliance checks within the Genesis and Master Architect engines to be a core, non-negotiable part of the generation process.'
            }
        ];
        res.json(insights);
    } catch (error) {
        next(error);
    }
};