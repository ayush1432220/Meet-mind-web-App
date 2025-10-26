import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { authService } from '../services/auth.service.js';
import { zoomService } from '../services/zoom.service.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
};

// --- User Auth ---

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.register(name, email, password);
  return res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user, accessToken }, 'Login successful'));
});

const logoutUser = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, {}, 'Logout successful'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    console.log(`Me is called`)
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Current user fetched successfully'));
});

// --- Zoom OAuth ---

const getZoomAuthUrl = asyncHandler(async (req, res) => {
  // We use req.user._id as the 'state' to identify the user on callback
  const url = zoomService.getZoomOAuthUrl(req.user._id.toString());
  return res.status(200).json(new ApiResponse(200, { url }, 'Zoom auth URL generated'));
});

const handleZoomCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const userId = state; // The user ID we passed in getZoomAuthUrl

  // Ensure the user ID from state matches the logged-in user (or handle appropriately)
  // For this app, we trust the state as it contains the user ID
  if (!userId) {
     throw new ApiError(400, 'Invalid OAuth state');
  }

  const result = await zoomService.handleOAuthCallback(code, userId);

  // Redirect user back to the frontend settings page
  res.redirect(`${process.env.CORS_ORIGIN}/dashboard/settings?zoom_connected=true`);
});


export const authController = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getZoomAuthUrl,
  handleZoomCallback
};
