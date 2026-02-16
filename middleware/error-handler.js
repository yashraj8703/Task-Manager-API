const errorHandler = (err, req, res, next) => {
  // Handle custom errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle invalid MongoDB ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid Task ID format",
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: err.message,
  });
};

module.exports = errorHandler;
