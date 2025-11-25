const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, licenseNumber, dateOfBirth, gender } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      role: role || 'patient',
      phone
    };

    // Add role-specific fields
    if (role === 'doctor') {
      userData.specialization = specialization;
      userData.licenseNumber = licenseNumber;
    } else if (role === 'patient') {
      userData.dateOfBirth = dateOfBirth;
      userData.gender = gender;
    }

    const user = await User.create(userData);

    // Send welcome email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to MediChain',
        html: emailTemplates.welcome(user.name)
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    // Create token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shareCode: user.shareCode,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Create token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shareCode: user.shareCode,
        isVerified: user.isVerified,
        specialization: user.specialization
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        html: emailTemplates.passwordReset(user.name, resetUrl)
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, address, specialization, licenseNumber } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update basic fields
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;

    // Update doctor-specific fields
    if (user.role === 'doctor') {
      if (specialization) {
        user.specialization = specialization;
        if (user.doctorInfo) {
          user.doctorInfo.specialization = specialization;
        }
      }
      if (licenseNumber) {
        user.licenseNumber = licenseNumber;
        if (user.doctorInfo) {
          user.doctorInfo.licenseNumber = licenseNumber;
        }
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/auth/profile-picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { db } = require('../config/db');
    const { GridFSBucket } = require('mongodb');
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    // Delete old profile picture if exists
    if (user.profilePicture) {
      try {
        const mongoose = require('mongoose');
        await bucket.delete(new mongoose.Types.ObjectId(user.profilePicture));
      } catch (err) {
        console.log('Old profile picture not found or already deleted');
      }
    }

    // Upload new profile picture
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: {
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
        type: 'profile-picture'
      }
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async () => {
      user.profilePicture = uploadStream.id.toString();
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        profilePicture: user.profilePicture,
        user
      });
    });

    uploadStream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading profile picture'
      });
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get all verified doctors
// @route   GET /api/auth/doctors
// @access  Private
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ 
      role: 'doctor', 
      isVerified: true 
    })
    .select('name email specialization licenseNumber phoneNumber doctorInfo')
    .lean()
    .exec();

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors'
    });
  }
};

// @desc    Get all patients (for doctors to create prescriptions)
// @route   GET /api/auth/patients
// @access  Private (Doctor)
exports.getPatients = async (req, res) => {
  try {
    const patients = await User.find({ 
      role: 'patient'
    })
    .select('name email phone dateOfBirth gender')
    .lean()
    .exec();

    res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients'
    });
  }
};