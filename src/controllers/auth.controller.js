import { User } from "../models/user.model.js";
import { issueTokensForUser, registerUser, validateCredentials } from "../services/auth.services.js";
import { ApiError } from "../utils/api-error.js";
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