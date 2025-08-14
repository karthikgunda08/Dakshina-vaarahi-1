// src/controllers/authController.js
import User from '../models/User.js';
import Project from '../models/Project.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import AppError from '../utils/AppError.js';
import * as emailService from '../services/emailService.js';

const EMAIL_REGEX = /\S+@\S+\.\S+/; // Simple email regex

export const register = async (req, res, next) => {
  try {
    const { email, password, phoneNumber, whatsappOptIn } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required.', 400));
    }
    if (!EMAIL_REGEX.test(email)) {
      return next(new AppError('Please provide a valid email address.', 400));
    }
    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters long.', 400));
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('User with this email already exists.', 409));
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const newUser = new User({ 
        email: email.toLowerCase(), 
        passwordHash,
        phoneNumber,
        whatsappOptIn,
    });
    const savedUser = await newUser.save();
    
    // Send welcome email
    try {
        await emailService.sendWelcomeEmail(savedUser.email, savedUser.name);
    } catch (emailError) {
        console.error(`[AUTH] Welcome email failed to send for ${savedUser.email}:`, emailError);
        // Do not block registration if email fails. Log the error.
    }

    const userForResponse = savedUser.toObject();
    delete userForResponse.passwordHash;
    
    const tokenPayload = { userId: savedUser._id, email: savedUser.email };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: userForResponse, message: 'User registered successfully!' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new AppError(error.message, 400));
    }
    next(error); 
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required.', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new AppError('Invalid credentials. User not found.', 401));
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next(new AppError('Invalid credentials. Password incorrect.', 401));
    }

    // Login Streak Logic
    const now = new Date();
    const lastLogin = user.lastLogin || new Date(0); // Handle new users without a lastLogin
    const diffTime = Math.abs(now - lastLogin);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 2) {
      user.loginStreak = 1; // Reset streak if more than 2 days have passed
    } else if (diffDays >= 1 && diffDays <= 2) {
      user.loginStreak = (user.loginStreak || 0) + 1; // Increment streak for consecutive days
    }
    user.lastLogin = now;
    await user.save();
    // End Login Streak Logic

    const tokenPayload = { userId: user._id, email: user.email }; 
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

    const userForResponse = user.toObject();
    delete userForResponse.passwordHash;
    
    res.json({ token, user: userForResponse, message: 'Login successful!' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
        }
        
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        
        await user.save();
        
        const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await emailService.sendPasswordResetEmail(user.email, resetURL);
        
        res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });

    } catch (error) {
        // In case of error, nullify the token fields to prevent security issues
        if (req.body.email) {
            const user = await User.findOne({ email: req.body.email });
            if (user) {
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                await user.save();
            }
        }
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return next(new AppError('Password reset token is invalid or has expired.', 400));
        }

        if (!req.body.password || req.body.password.length < 6) {
            return next(new AppError('Password must be at least 6 characters long.', 400));
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(req.body.password, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        const tokenPayload = { userId: user._id, email: user.email };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
        res.status(200).json({ token, user: user.toObject(), message: 'Password has been reset successfully.' });
    } catch (error) {
        next(error);
    }
};


export const getProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) { 
      return next(new AppError('User not authenticated.', 401));
    }

    const user = await User.findById(req.user.userId).select('-passwordHash'); 

    if (!user) {
      return next(new AppError('User not found.', 404));
    }
    
    res.json(user.toObject());
  } catch (error) {
    next(error);
  }
};

// User Analytics Controller
export const getUserAnalytics = async (req, res, next) => {
  try {
    const { userId } = req.user;
    
    const user = await User.findById(userId).select('loginStreak');
    if (!user) {
      return next(new AppError('User not found.', 404));
    }
    
    const projects = await Project.find({ userId }).select('projectType name updatedAt').sort({ updatedAt: -1 });

    const analyticsData = {
        totalProjects: projects.length,
        loginStreak: user.loginStreak || 1,
        activityLog: projects.slice(0, 5).map(p => ({
            id: p._id.toString(),
            action: 'Updated Project',
            details: p.name,
            timestamp: p.updatedAt,
        })),
    };

    res.json(analyticsData);

  } catch (error) {
    next(error);
  }
};


export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { name, profession, bio, isProfilePublic, portfolioUrl, linkedInUrl, phoneNumber, whatsappOptIn, hasCompletedFirstMission } = req.body;

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return next(new AppError('User not found.', 404));
    }

    // Update standard fields
    userToUpdate.name = name !== undefined ? name : userToUpdate.name;
    userToUpdate.profession = profession !== undefined ? profession : userToUpdate.profession;
    userToUpdate.bio = bio !== undefined ? bio : userToUpdate.bio;
    userToUpdate.phoneNumber = phoneNumber !== undefined ? phoneNumber : userToUpdate.phoneNumber;
    userToUpdate.whatsappOptIn = whatsappOptIn !== undefined ? whatsappOptIn : userToUpdate.whatsappOptIn;
    
    // Update public profile fields
    userToUpdate.isProfilePublic = isProfilePublic !== undefined ? isProfilePublic : userToUpdate.isProfilePublic;
    userToUpdate.portfolioUrl = portfolioUrl !== undefined ? portfolioUrl : userToUpdate.portfolioUrl;
    userToUpdate.linkedInUrl = linkedInUrl !== undefined ? linkedInUrl : userToUpdate.linkedInUrl;

    // Update onboarding fields
    userToUpdate.hasCompletedFirstMission = hasCompletedFirstMission !== undefined ? hasCompletedFirstMission : userToUpdate.hasCompletedFirstMission;
    
    if(hasCompletedFirstMission && !userToUpdate.onboardingRewardClaimed) {
        userToUpdate.credits += 25;
        userToUpdate.onboardingRewardClaimed = true;
    }


    const updatedUser = await userToUpdate.save();
    
    const userForResponse = updatedUser.toObject();
    delete userForResponse.passwordHash;
    
    res.json(userForResponse);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return next(new AppError('Both current and new password (min 6 characters) are required.', 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return next(new AppError('Incorrect current password.', 401));
    }
    
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const generateApiKey = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    const newApiKey = `aura_sk_${crypto.randomBytes(24).toString('hex')}`;
    user.apiKey = newApiKey;

    await user.save();

    res.json({ apiKey: newApiKey });
  } catch (error) {
    next(error);
  }
};


// --- WORKSPACE CONTROLLERS ---

export const getWorkspaces = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select('workspaces');
        if (!user) {
            return next(new AppError('User not found.', 404));
        }
        res.json(user.workspaces.map(w => w.toObject()));
    } catch (error) {
        next(error);
    }
};

export const saveWorkspace = async (req, res, next) => {
    try {
        const { name, layout } = req.body;
        if (!name || !layout) {
            return next(new AppError('Workspace name and layout are required.', 400));
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return next(new AppError('User not found.', 404));
        }

        const existingWorkspaceIndex = user.workspaces.findIndex(w => w.name === name);
        if (existingWorkspaceIndex > -1) {
            // Update existing workspace
            user.workspaces[existingWorkspaceIndex].layout = layout;
        } else {
            // Add new workspace
            user.workspaces.push({ name, layout });
        }

        await user.save();
        res.status(200).json(user.workspaces.map(w => w.toObject()));

    } catch (error) {
        next(error);
    }
};

export const deleteWorkspace = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const user = await User.findById(req.user.userId);
        if (!user) {
            return next(new AppError('User not found.', 404));
        }

        user.workspaces.pull({ _id: workspaceId });
        await user.save();

        res.status(200).json(user.workspaces.map(w => w.toObject()));

    } catch (error) {
        next(error);
    }
};
