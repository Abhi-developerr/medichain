const User = require('../models/User');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// @desc    Enable 2FA - Generate secret and QR code
// @route   POST /api/auth/2fa/enable
// @access  Private
exports.enable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication is already enabled'
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `MediChain (${user.email})`,
      length: 32
    });

    // Save secret temporarily (not enabled yet until verified)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      message: 'Scan this QR code with your authenticator app',
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify 2FA token and activate
// @route   POST /api/auth/2fa/verify
// @access  Private
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a token'
      });
    }

    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'Please enable 2FA first'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
exports.disable2FA = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and password'
      });
    }

    const user = await User.findById(req.user._id).select('+password +twoFactorSecret');

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication is not enabled'
      });
    }

    // Verify password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Verify 2FA token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify 2FA token during login
// @route   POST /api/auth/2fa/validate
// @access  Public
exports.validate2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and token'
      });
    }

    const user = await User.findById(userId).select('+twoFactorSecret');

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token verified successfully'
    });
  } catch (error) {
    console.error('Validate 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
