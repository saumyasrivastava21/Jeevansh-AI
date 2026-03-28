const jwt = require("jsonwebtoken");
const User = require("../models/UserModel.js");
const { ApiError } = require("../utils/apiResponse.js");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret_key_123"
      );
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return next(new ApiError(401, "Not authorized, token failed"));
    }
  }

  if (!token) {
    return next(new ApiError(401, "Not authorized, no token"));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role ${req.user ? req.user.role : "unauthenticated"
          } is not authorized to access this route`
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
