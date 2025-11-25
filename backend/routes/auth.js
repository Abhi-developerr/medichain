const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
  updateProfile,
  changePassword,
  getDoctors,
  getPatients,
  uploadProfilePicture
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/doctors', protect, getDoctors);
router.get('/patients', protect, getPatients);
router.put('/profile', protect, updateProfile);
router.post('/profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);
router.put('/change-password', protect, changePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/logout', protect, logout);

module.exports = router;