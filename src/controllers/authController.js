import User from '../models/user.js';

// ✅ SIGNUP - Create new user account
const signup = async (req, res) => {
  try {
    console.log('👤 User signup request');

    const { name, email, phoneNumber, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phoneNumber,
      password
    });

    await user.save();

    // Get user details without password
    const userDetails = user.toJSON();

    console.log(`✅ User created: ${user._id}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userDetails
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Handle duplicate key error (unique email)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: error.message
    });
  }
};

// ✅ LOGIN - Authenticate user
const login = async (req, res) => {
  try {
    console.log('🔐 User login request');

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    // if (!user.isActive) {
    //   console.log('❌ User account is inactive:', email);
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Account is deactivated. Please contact administrator.'
    //   });
    // }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Get user details without password
    const userDetails = user.toJSON();

    console.log(`✅ User logged in: ${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userDetails,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    console.log('🚪 User logout request');

    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found for logout:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log(`✅ User logout requested for: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Logout requested successfully',
      userId: userId,
    });
  } catch (error) {
    console.error('❌ Logout error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message,
    });
  }
};

// ✅ GET CURRENT USER - Get logged in user info
const getCurrentUser = async (req, res) => {
  try {
    console.log('👤 Get current user request');

    if (!req.session.userId) {
      console.log('❌ No user session found');
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const user = await User.findById(req.session.userId).select(
      '-password -__v'
    );

    if (!user) {
      console.log('❌ User not found in database');
      // Clear invalid session
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('✅ Current user retrieved:', user._id);

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message,
    });
  }
};

// ✅ CHECK AUTH - Check if user is authenticated
const checkAuth = async (req, res) => {
  try {
    console.log('🔍 Check authentication');

    if (!req.session.userId) {
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        message: 'Not authenticated',
      });
    }

    // Verify user still exists in database
    const user = await User.findById(req.session.userId).select(
      '_id name email role'
    );

    if (!user) {
      // Clear invalid session
      req.session.destroy();
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        message: 'Session expired',
      });
    }

    res.status(200).json({
      success: true,
      isAuthenticated: true,
      message: 'User is authenticated',
      user,
    });
  } catch (error) {
    console.error('❌ Check auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking authentication',
      error: error.message,
    });
  }
};

// ✅ UPDATE PROFILE - Update user profile
const updateProfile = async (req, res) => {
  try {
    console.log('✏️ Update profile request');

    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields (don't allow email/password update here - separate endpoints)
    const { name, phoneNumber } = req.body;

    if (name !== undefined) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

    await user.save();

    // Update session info
    req.session.user.name = user.name;

    console.log(`✅ Profile updated: ${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// ✅ CHANGE PASSWORD - Change user password
const changePassword = async (req, res) => {
  try {
    console.log('🔑 Change password request');

    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(
      currentPassword
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log(`✅ Password changed for user: ${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message,
    });
  }
};

export {
  signup,
  login,
  logout,
  getCurrentUser,
  checkAuth,
  updateProfile,
  changePassword,
};
