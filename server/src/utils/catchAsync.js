// A utility function to catch errors in asynchronous route handlers and pass them to the error handling middleware.
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;