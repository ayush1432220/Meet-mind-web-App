import { ApiError } from '../utils/apiError.js';

const globalErrorHandler = (err, req, res, next) => {
  // If the error is an instance of our ApiError, use its properties
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Handle express-validator errors
  if (err.errors && Array.isArray(err.errors)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({ msg: e.msg, param: e.path })),
    });
  }

  // For other unexpected errors, send a generic 500 response
  console.error('Unhandled Error:', err);
  
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    errors: [],
  });
};

export { globalErrorHandler };
