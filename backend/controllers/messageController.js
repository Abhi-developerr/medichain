const Message = require('../models/Message');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Send message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { recipient, message, relatedReport, relatedAppointment } = req.body;

    // Verify recipient exists and has appropriate role
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Patients can only message doctors and vice versa
    if (req.user.role === 'patient' && recipientUser.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Patients can only message doctors'
      });
    }

    if (req.user.role === 'doctor' && recipientUser.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Doctors can only message patients'
      });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      recipient,
      message,
      relatedReport,
      relatedAppointment
    });

    await newMessage.populate('sender', 'name role');
    await newMessage.populate('recipient', 'name role');

    // Send notification
    await createNotification({
      user: recipient,
      type: 'new_message',
      title: 'New Message',
      message: `${req.user.name} sent you a message`,
      relatedId: newMessage._id
    });

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// @desc    Get conversation with a user
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId, isDeleted: false },
        { sender: userId, recipient: req.user._id, isDeleted: false }
      ]
    })
      .populate('sender', 'name role profilePicture')
      .populate('recipient', 'name role profilePicture')
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    const count = await Message.countDocuments({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ],
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      messages,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation'
    });
  }
};

// @desc    Get all conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = new mongoose.Types.ObjectId(req.user._id);
    
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ],
          isDeleted: false
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $project: {
          otherUser: {
            _id: 1,
            name: 1,
            role: 1,
            email: 1,
            specialization: 1,
            profilePicture: 1
          },
          lastMessage: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching conversations'
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      isRead: false,
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count'
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    message.isDeleted = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message'
    });
  }
};
