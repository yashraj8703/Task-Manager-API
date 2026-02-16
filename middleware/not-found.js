const NotFoundError = require("../errors/not-found");

const notFound = (req, res, next) => {
  next(new NotFoundError("Route not found"));
};

module.exports = notFound;
