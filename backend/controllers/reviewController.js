const Review = require('../models/Review');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Patient only)
exports.createReview = async (req, res) => {
  try {
    const { doctor, appointment, rating, professionalism, communication, punctuality, thoroughness, comment, isAnonymous } = req.body;

    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can create reviews'
      });
    }

    // Check if review already exists for this appointment
    if (appointment) {
      const existingReview = await Review.findOne({ patient: req.user._id, appointment });
      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this appointment'
        });
      }
    }

    const review = await Review.create({
      doctor,
      patient: req.user._id,
      appointment,
      rating,
      professionalism,
      communication,
      punctuality,
      thoroughness,
      comment,
      isAnonymous,
      isVerified: appointment ? true : false
    });

    await review.populate('patient', 'name');
    await review.populate('doctor', 'name specialization');

    // Update doctor's average rating
    await updateDoctorRating(doctor);

    // Send notification to doctor
    await createNotification({
      user: doctor,
      type: 'new_review',
      title: 'New Review Received',
      message: `You received a ${rating}-star review`,
      relatedId: review._id
    });

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating review'
    });
  }
};

// @desc    Get reviews for a doctor
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
exports.getDoctorReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const mongoose = require('mongoose');

    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate('patient', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments({ doctor: req.params.doctorId });

    // Calculate average ratings
    const stats = await Review.aggregate([
      { $match: { doctor: new mongoose.Types.ObjectId(req.params.doctorId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          avgProfessionalism: { $avg: '$professionalism' },
          avgCommunication: { $avg: '$communication' },
          avgPunctuality: { $avg: '$punctuality' },
          avgThoroughness: { $avg: '$thoroughness' }
        }
      }
    ]);

    const statsResult = stats[0] || {
      averageRating: 0,
      totalReviews: 0,
      avgProfessionalism: 0,
      avgCommunication: 0,
      avgPunctuality: 0,
      avgThoroughness: 0
    };

    res.status(200).json({
      success: true,
      reviews,
      stats: {
        averageRating: statsResult.averageRating || 0,
        totalReviews: statsResult.totalReviews || 0,
        categoryAverages: {
          professionalism: statsResult.avgProfessionalism || 0,
          communication: statsResult.avgCommunication || 0,
          punctuality: statsResult.avgPunctuality || 0,
          thoroughness: statsResult.avgThoroughness || 0
        }
      },
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get doctor reviews error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reviews'
    });
  }
};

// @desc    Add doctor response to review
// @route   PUT /api/reviews/:id/response
// @access  Private (Doctor only)
exports.addDoctorResponse = async (req, res) => {
  try {
    const { message } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this review'
      });
    }

    review.doctorResponse = {
      message,
      respondedAt: new Date()
    };

    await review.save();

    res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Add doctor response error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding response'
    });
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const index = review.helpful.indexOf(req.user._id);
    if (index > -1) {
      review.helpful.splice(index, 1);
    } else {
      review.helpful.push(req.user._id);
    }

    await review.save();

    res.status(200).json({
      success: true,
      helpfulCount: review.helpful.length
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review'
    });
  }
};

// Helper function to update doctor's average rating
async function updateDoctorRating(doctorId) {
  const mongoose = require('mongoose');
  const stats = await Review.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(doctorId, {
      'doctorInfo.averageRating': stats[0].averageRating,
      'doctorInfo.totalReviews': stats[0].totalReviews
    });
  }
}
