import axios from 'axios';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';

// This function would be called by your /auth/zoom/callback route
const handleOAuthCallback = async (code, userId) => {
  
  // --- REAL IMPLEMENTATION ---
  // In a real app, you would exchange the code for tokens
  /*
  try {
    const response = await axios.post(
      'https://zoom.us/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: process.env.ZOOM_OAUTH_REDIRECT_URI,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    const expiresAt = new Date(Date.now() + expires_in * 1000);
    
    // TODO: Encrypt tokens before saving
    await User.findByIdAndUpdate(userId, {
      isZoomConnected: true,
      zoomAuth: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expiresAt,
      },
    });

    return { success: true, message: 'Zoom account connected successfully.' };

  } catch (error) {
    console.error('Zoom OAuth Error:', error.response?.data || error.message);
    throw new ApiError(500, 'Failed to authenticate with Zoom');
  }
  */

  // --- MOCKED IMPLEMENTATION ---
  // For demonstration, we'll just simulate success
  console.log(`[Mock Zoom Service] Handling OAuth callback for user ${userId} with code ${code}`);
  await User.findByIdAndUpdate(userId, {
    isZoomConnected: true,
    zoomAuth: {
      accessToken: 'mock_encrypted_access_token',
      refreshToken: 'mock_encrypted_refresh_token',
      expiresAt: new Date(Date.now() + 3600 * 1000), // Expires in 1 hour
    },
  });

  return { success: true, message: 'Zoom account connected successfully (Mock).' };
};

const getZoomOAuthUrl = (userId) => {
  const url = new URL('https://zoom.us/oauth/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', process.env.ZOOM_CLIENT_ID);
  url.searchParams.set('redirect_uri', process.env.ZOOM_OAUTH_REDIRECT_URI);
  // Pass user ID to identify who is authorizing
  url.searchParams.set('state', userId); 
  return url.toString();
};

export const zoomService = {
  handleOAuthCallback,
  getZoomOAuthUrl,
};
