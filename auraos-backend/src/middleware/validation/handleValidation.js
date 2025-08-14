
// src/middleware/validation/handleValidation.js
import { validationResult } from 'express-validator';
import AppError from '../../utils/AppError.js';

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Get the first error message for a simple response
    const firstError = errors.array({ onlyFirstError: true })[0];
    return next(new AppError(firstError.msg, 400));
  }
  next();
};
