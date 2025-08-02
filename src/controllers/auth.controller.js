import { ApiKey } from "../models/apiKey.model.js";
import { User } from "../models/user.model.js";
import { issueTokensForUser, registerUser, validateCredentials } from "../services/auth.services.js";
import { ApiError } from "../utils/api-error.js";
import { generateRawApiKey, hashKey } from "../utils/api-key.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler} from "../utils/async-handler.js";
import { setAuthCookies } from "../utils/cookies.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

export const register = asyncHandler(async (req, res) => {

    const { fullName, email, username, password } = req.body;

    if(!fullName || !email || !username || !password) {
        throw new ApiError(400, 'All fields are required');
    }

    const existingUser = await User.find({ $or: [{email}, {username}]});

    if(existingUser.length > 0) {
        throw new ApiError(400, 'User with this email or username already exists');
    }

    const user = await registerUser({ fullName, email, username, password });

   const accessToken = generateAccessToken({
     _id: user._id,
     email: user.email,
     role: user.role,
   });

   const refreshToken = generateRefreshToken({ _id: user._id });

   user.refreshToken = refreshToken;
   await user.save();

   setAuthCookies(res, accessToken, refreshToken);

   return new ApiResponse(201, {
        user: {
            _id: user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.createdAt,
            isEmailVerified: user.isEmailVerified,
        }
    }, 'User registered successfully').send(res);

});


export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await validateCredentials(email, password);

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = await issueTokensForUser(user);

  setAuthCookies(res, accessToken, refreshToken);

  return new ApiResponse(
    200,
    {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        isEmailVerified: user.isEmailVerified,
      },
      token: {
        accessToken,
        refreshToken,
      },
    },
    'Login successful'
  ).send(res);
});

export const getUserDetails = asyncHandler(async (req, res) => {
  const user = req.user;

  return new ApiResponse(
    200,
    {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
    'User profile fetched successfully'
  ).send(res);
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await User.findOneAndUpdate(
      { refreshToken },
      { $unset: { refreshToken: '' } },
      { new: true }
    );

    clearAuthCookies(res);

    return new ApiResponse(200, null, 'Logged out successfully').send(res);
  }
});


export const checkAdminAccess = asyncHandler(async (req, res) => {
  if (req?.user?.role !== 'admin') {
    throw new ApiError(403, 'Access denied: Admins only');
  }

  const userDetails = {
    _id: req.user._id,
    email: req.user.email,
    username: req.user.username,
    fullName: req.user.fullName,
    role: req.user.role,
    createdAt: req.user.createdAt,
  };

  return new ApiResponse(
    200,
    userDetails,
    'Access granted: Admin user',
    'Admin access check successful'
  ).send(res);
});

export const generateUserApiKey = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, 'Unauthorized: User not found');
  }

  // ensure no active key exists
  const existingKey = await ApiKey.findOne({ user: userId, isActive: true });
  if (existingKey) {
    throw new ApiError(
      400,
      'User already has an active API key. Revoke it first before generating a new one'
    );
  }

  // generate raw & hashed
  const rawKey = generateRawApiKey();
  const hashed = hashKey(rawKey);

  // create API key doc (store hashed), optional expiresAt can be added
  await ApiKey.create({
    user: userId,
    key: hashed,
    isActive: true,
  });

  // send raw key back once
  return new ApiResponse(
    201,
    { apiKey: rawKey },
    'API key generated successfully'
  ).send(res);
});