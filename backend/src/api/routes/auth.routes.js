import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate, registerValidationRules, loginValidationRules } from '../middlewares/validation.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Public Routes
router.post('/register', registerValidationRules(), validate, asyncHandler(authController.registerUser));
router.post('/login', loginValidationRules(), validate, asyncHandler(authController.loginUser));

// Zoom OAuth Routes
router.get('/zoom/url', verifyJWT, asyncHandler(authController.getZoomAuthUrl));
router.get('/zoom/callback', asyncHandler(authController.handleZoomCallback)); // No JWT, called by Zoom

// Secure Routes
router.post('/logout', verifyJWT, asyncHandler(authController.logoutUser));
router.get('/me', verifyJWT, asyncHandler(authController.getCurrentUser));

export default router;
