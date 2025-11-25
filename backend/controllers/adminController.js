const User = require('../models/User');
const Report = require('../models/Report');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isVerified, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Get pending doctor verifications
// @route   GET /api/admin/pending-doctors
// @access  Private/Admin
exports.getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await User.find({
      role: 'doctor',
      isVerified: false
    }).select('-password');

    res.status(200).json({
      success: true,
      count: pendingDoctors.length,
      doctors: pendingDoctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending doctors'
    });
  }
};

// @desc    Verify doctor account
// @route   PUT /api/admin/verify-doctor/:id
// @access  Private/Admin
exports.verifyDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (doctor.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'User is not a doctor'
      });
    }

    doctor.isVerified = true;
    await doctor.save();

    // Send verification email
    try {
      await sendEmail({
        email: doctor.email,
        subject: 'Your Doctor Account Has Been Verified',
        html: emailTemplates.doctorVerification(doctor.name)
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Doctor verified successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying doctor'
    });
  }
};

// @desc    Reject doctor account
// @route   PUT /api/admin/reject-doctor/:id
// @access  Private/Admin
exports.rejectDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    await doctor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Doctor account rejected and removed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting doctor'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/user-role/:id
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor', isVerified: true });
    const pendingDoctors = await User.countDocuments({ role: 'doctor', isVerified: false });
    const totalReports = await Report.countDocuments();

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        pendingDoctors,
        totalReports,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
};

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getSystemLogs = async (req, res) => {
  try {
    // This is a placeholder - implement actual logging system
    res.status(200).json({
      success: true,
      logs: [],
      message: 'Logging system not implemented yet'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching logs'
    });
  }
};
   

// @desc    Reject doctor verification
// @route   DELETE /api/admin/reject-doctor/:id
// @access  Private/Admin
exports.rejectDoctor = async (req, res) => {
  try {
    const doctor = await User.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor application rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting doctor'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If patient, delete all their reports
    if (user.role === 'patient') {
      await Report.deleteMany({ patient: user._id });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const pendingDoctors = await User.countDocuments({ role: 'doctor', isVerified: false });
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const urgentReports = await Report.countDocuments({ status: 'urgent' });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        pendingDoctors,
        totalReports,
        pendingReports,
        urgentReports
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getSystemLogs = async (req, res) => {
  try {
    // Placeholder for logging system
    res.status(200).json({
      success: true,
      logs: [],
      message: 'Logging system not implemented yet'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching logs'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/user-role/:id
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
};