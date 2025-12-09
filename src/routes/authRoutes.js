import express from 'express';
import {
  signup,
  login,
  logout,
  getCurrentUser,
  checkAuth,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/signup', signup); // Create new account
router.post('/login', login); // Login to account
router.get('/check', checkAuth); // Check authentication status

// Protected routes (require authentication)
router.post('/logout', logout); // Logout
router.get('/me', getCurrentUser); // Get current user
router.put('/profile', updateProfile); // Update profile
router.put('/change-password', changePassword); // Change password

export default router;
