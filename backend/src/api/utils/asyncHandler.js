// Utility wrapper for async route handlers
// Catches errors and passes them to the global error handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export { asyncHandler };
