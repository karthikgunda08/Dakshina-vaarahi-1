// src/middleware/ownerMiddleware.js
import User from '../models/User.js';

const ownerMiddleware = async (req, res, next) => {
    // This middleware should run AFTER authMiddleware
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }
    
    try {
        const user = await User.findById(req.user.userId).select('role');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        if (user.role !== 'owner') {
            return res.status(403).json({ message: 'Forbidden. Owner access required.' });
        }
        
        next();
    } catch (error) {
        console.error("Owner middleware error:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export default ownerMiddleware;
