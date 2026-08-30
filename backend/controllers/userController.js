const User = require("../models/UserModel");
const { ApiResponse, ApiError } = require("../utils/apiResponse");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return next(new ApiError(400, "User already exists"));

    // Password strength validation
    if (!password || password.length < 8) {
      return next(new ApiError(400, "Password must be at least 8 characters long."));
    }
    if (!/[A-Z]/.test(password)) {
      return next(new ApiError(400, "Password must contain at least one uppercase letter (A-Z)."));
    }
    if (!/[a-z]/.test(password)) {
      return next(new ApiError(400, "Password must contain at least one lowercase letter (a-z)."));
    }
    if (!/\d/.test(password)) {
      return next(new ApiError(400, "Password must contain at least one digit (0-9)."));
    }
    if (!/[^A-Za-z0-9\s]/.test(password)) {
      return next(new ApiError(400, "Password must contain at least one special character (e.g. @, #, $, %)."));
    }
    if (/\s/.test(password)) {
      return next(new ApiError(400, "Password must not contain spaces."));
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role,
    });

    if (user) {
      res.status(201).json(
        new ApiResponse(
          201,
          {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
          },
          "User registered successfully"
        )
      );
    } else {
      next(new ApiError(400, "Invalid user data"));
    }
  } catch (error) {
    next(error);
  }
};

const authUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      // Validate that the user's registered role matches the login selection
      // Admins are allowed to login as any role (patient, doctor, or admin)
      // Doctors/Patients must match the selected role
      if (role && user.role !== "admin" && user.role !== role) {
        return next(
          new ApiError(
            403,
            `Access Denied: You are registered as a ${user.role}, but tried to login as a ${role}.`
          )
        );
      }

      res.json(
        new ApiResponse(
          200,
          {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
          },
          "Login successful"
        )
      );
    } else {
      next(new ApiError(401, "Invalid email or password"));
    }
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(new ApiResponse(200, user, "Profile fetched successfully"));
    } else {
      next(new ApiError(404, "User not found"));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, authUser, getUserProfile };
