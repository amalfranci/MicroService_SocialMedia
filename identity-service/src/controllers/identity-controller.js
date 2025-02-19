const User = require("../models/User.js");
const generateToken = require("../utils/generateToken.js");
const logger = require("../utils/logger.js");
const argon2 = require("argon2");
const {
  validateRegisteration,
  validateUserLogin,
} = require("../utils/validations.js");
const RefreshToken = require("../models/RefreshToken.js");
validateRegisteration;
// user regiseration

const registerUser = async (req, res) => {
  try {
    logger.info("Registration endpoint hit..");

    // Validate the request body
    const validationResult = validateRegisteration(req.body);
    if (validationResult.error) {
      logger.warn(
        "Validation error",
        validationResult.error.details[0].message
      );
      return res.status(400).json({
        success: false,
        message: validationResult.error.details[0].message,
      });
    }

    const { email, password, username } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User already exists with these credentials");
      return res.status(400).json({
        success: false,
        message: "User already exists with these credentials",
      });
    }

    // Create a new user
    user = new User({ username, email, password });
    await user.save();
    logger.info("User saved successfully", user._id);

    // Generate tokens
    const { accessToken, refreshToken } = await generateToken(user);

    console.log("AccessToken ====>", accessToken);
    console.log("RefreshToken ====>", refreshToken);

    // Respond with success
    res.status(201).json({
      success: true,
      message: "User registration completed successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Registration error occurred", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred",
    });
  }
};

// user login

const userLogin = async (req, res) => {
  try {
    // Validate the request body
    const validationResult = validateUserLogin(req.body);
    if (validationResult.error) {
      logger.warn(
        "Validation error",
        validationResult.error.details[0].message
      );
      return res.status(400).json({
        success: false,
        message: validationResult.error.details[0].message,
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isMatch = await argon2.verify(user.password, password);

    // Check if password matches
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateToken(user);

    // Respond with success
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Login error occurred", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred",
    });
  }
};

// refresh token

const userRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("refreshToken is missing");
      return res.status(400).json({
        message: "Please provide refresh token",
      });
    }

    const storeToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storeToken || storeToken.expiresAt < new Date()) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById(storeToken.user);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user);

    // Delete old refresh token
    await RefreshToken.deleteOne({ _id: storeToken._id });

    // Store new refresh token
    // await RefreshToken.create({
    //   token: newRefreshToken,
    //   user: user._id,
    //   expiresAt: 1
    // });

    return res.status(200).json({
      message: "Tokens refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(500).json({
      message: "Internal server error while refreshing tokens"
    });
  }
};

const userLogout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required for logout"
      });
    }

    // Find and delete the refresh token from database
    const deletedToken = await RefreshToken.findOneAndDelete({ 
      token: refreshToken 
    });

    if (!deletedToken) {
      return res.status(200).json({
        message: "Already logged out"
      });
    }

    return res.status(200).json({
      message: "Logged out successfully"
    });

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Internal server error during logout"
    });
  }
};


module.exports = { registerUser, userLogin ,userRefreshToken,userLogout};
