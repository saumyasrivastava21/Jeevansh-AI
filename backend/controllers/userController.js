const User = require("../models/UserModel");
const { ApiResponse, ApiError } = require("../utils/apiResponse");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return next(new ApiError(400, "User already exists"));

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
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
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
