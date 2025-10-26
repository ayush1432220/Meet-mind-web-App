import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { generateAccessAndRefreshTokens } from '../utils/token.util.js';

const register = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const user = await User.create({ name, email, password });
  const createdUser = await User.findById(user._id).select('-password -refreshToken');

  if (!createdUser) {
    throw new ApiError(500, 'Failed to register user');
  }

  return createdUser;
};

const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

  return { user: loggedInUser, accessToken, refreshToken };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  return { message: 'Logged out successfully' };
};

export const authService = {
  register,
  login,
  logout,
};
