const { ApiError } = require("../utils/apiResponse");

const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode =
    err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode) || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
    errors: err.errors || [],
  });
};

module.exports = { notFound, errorHandler };
