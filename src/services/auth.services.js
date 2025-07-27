import { User } from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { generateVerificationToken } from '../utils/token.js';
import bcrypt from 'bcryptjs';

export const registerUser = async ({ fullName, email, username, password }) => {
  try {
    const { unHashedToken, hashedToken, expiry } = generateVerificationToken();

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fullName
    )}&background=random`;

    const user = await User.create({
      fullName,
      email,
      username,
      password,
      avatar: {
        url: avatarUrl,
        localPath: '', // will be used if you support file upload later
      },
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: expiry,
    });

    // TODO: Send verification email with unHashedToken (e.g., `https://yourdomain.com/verify-email?token=${unHashedToken}`)

    return user;
  } catch (error) {
    console.log('Error in registerUser service:', error);
    throw new ApiError(500, 'Internal Server Error');
  }
};

export const validateCredentials = async (email, password) => {
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
  } catch (error) {
    console.error('Error validating credentials:', error);
    throw new Error('Validation failed');
  }
};

export const issueTokensForUser = async (user) => {
  const accessToken = generateAccessToken({
    _id: user._id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({ _id: user._id });

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};
