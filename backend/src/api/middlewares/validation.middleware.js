import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/apiError.js';

// Middleware to run the validations
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  // Throw a structured error that the global error handler can catch
  const extractedErrors = errors.array().map(err => ({ msg: err.msg, param: err.path }));
  throw new ApiError(400, 'Validation failed', extractedErrors);
};

// Specific validation rules
const registerValidationRules = () => [
  body('email').isEmail().withMessage('Email must be valid'),
  body('name').notEmpty().withMessage('Name is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

const loginValidationRules = () => [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').notEmpty().withMessage('Password is required'),
];

const startMeetingValidationRules = () => [
  body('zoomMeetingId').notEmpty().withMessage('zoomMeetingId is required'),
  body('title').notEmpty().withMessage('Meeting title is required'),
];

const endMeetingValidationRules = () => [
  body('transcript').isArray().withMessage('Transcript must be an array'),
];


export {
  validate,
  registerValidationRules,
  loginValidationRules,
  startMeetingValidationRules,
  endMeetingValidationRules
};
