import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  if ([fullName, email, username, password].some((field) => typeof field !== "string" || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const lowerUsername = username.toLowerCase().trim();
  const lowerEmail = email.toLowerCase().trim();
  const existedUser = await User.findOne({
    $or: [{ username: lowerUsername }, { email: lowerEmail }]
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  const user = await User.create({
    fullName: fullName.trim(),
    email: lowerEmail,
    password,
    username: lowerUsername
  });
  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Error registering user");
  }
  return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || typeof username !== "string" || username.trim() === "") {
    throw new ApiError(400, "Username is required");
  }
  const user = await User.findOne({ username: username.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const user = await User.findById(decodedToken._id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }
  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token expired or invalid");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old and new passwords are required");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email are required");
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { fullName: fullName.trim(), email: email.toLowerCase().trim() } },
    { new: true }
  ).select("-password -refreshToken");
  if (!updatedUser) {
    throw new ApiError(500, "Error updating account details");
  }
  return res.status(200).json(new ApiResponse(200, updatedUser, "Account details updated successfully"));
});

const setAvatar = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const avatarImage = req.body.image;
  if (!avatarImage || typeof avatarImage !== "string" || avatarImage.trim() === "") {
    throw new ApiError(400, "Avatar image data is required");
  }
  const user = await User.findByIdAndUpdate(
    id,
    { isAvatarImageSet: true, AvatarImage: avatarImage },
    { new: true }
  ).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(400, "User not updated");
  }
  return res.status(200).json(new ApiResponse(200, user, "Avatar image set successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.params.id } }).select("-password -refreshToken");
  return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  setAvatar,
  getAllUsers
};
