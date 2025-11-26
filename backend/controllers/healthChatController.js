const HealthChat = require('../models/HealthChat');

// Simulated AI responses (in production, integrate with OpenAI/Claude API)
const generateAIResponse = (userMessage, category) => {
  const responses = {
    general: "I'm here to help with your health questions. Please note that I'm an AI assistant and my advice should not replace professional medical consultation. How can I assist you today?",
    symptoms: "I understand you're experiencing symptoms. Could you describe them in more detail? Remember, if symptoms are severe or worsening, please seek immediate medical attention.",
    medication: "I can provide general information about medications. Always consult your doctor or pharmacist for specific medical advice. What would you like to know?",
    emergency: "⚠️ If this is a medical emergency, please call emergency services immediately or go to the nearest hospital. I'm here for general guidance only.",
    'mental-health': "Mental health is just as important as physical health. I'm here to listen and provide support. If you're in crisis, please reach out to a mental health professional or crisis helpline.",
    nutrition: "Good nutrition is essential for health. I can provide general nutritional guidance, but for personalized diet plans, consult a registered dietitian.",
    exercise: "Regular exercise has numerous health benefits. I can suggest general fitness tips, but consult a healthcare provider before starting any new exercise program."
  };
  
  return responses[category] || responses.general;
};

// Get all chat sessions
exports.getChatSessions = async (req, res) => {
  try {
    const sessions = await HealthChat.find({ 
      user: req.user._id,
      status: { $ne: 'archived' }
    })
    .select('-messages')
    .sort({ lastActivity: -1 });
    
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new chat session
exports.createChatSession = async (req, res) => {
  try {
    const { title, category, initialMessage } = req.body;
    
    const sessionId = `CHAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const messages = [];
    
    // Add system message
    messages.push({
      role: 'system',
      content: 'I am MediChain Health Assistant. I can help answer your health questions, provide information about symptoms, medications, and general wellness. However, I am not a replacement for professional medical advice.',
      timestamp: new Date()
    });
    
    // Add initial user message if provided
    if (initialMessage) {
      messages.push({
        role: 'user',
        content: initialMessage,
        timestamp: new Date()
      });
      
      // Generate AI response
      const aiResponse = generateAIResponse(initialMessage, category || 'general');
      messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });
    }
    
    const session = await HealthChat.create({
      user: req.user._id,
      sessionId,
      title: title || 'New Conversation',
      category: category || 'general',
      messages
    });
    
    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single chat session
exports.getChatSession = async (req, res) => {
  try {
    const session = await HealthChat.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }
    
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send message in chat
exports.sendMessage = async (req, res) => {
  try {
    const { content, category } = req.body;
    
    const session = await HealthChat.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }
    
    // Add user message
    session.messages.push({
      role: 'user',
      content,
      timestamp: new Date()
    });
    
    // Detect emergency keywords
    const emergencyKeywords = ['chest pain', 'can\'t breathe', 'bleeding heavily', 'unconscious', 'overdose', 'suicide'];
    const isEmergency = emergencyKeywords.some(keyword => content.toLowerCase().includes(keyword));
    
    if (isEmergency) {
      session.flagged = true;
      session.flagReason = 'Emergency keywords detected';
      session.category = 'emergency';
    }
    
    // Generate AI response
    const aiResponse = isEmergency 
      ? "🚨 EMERGENCY DETECTED: Please call emergency services immediately (911 in US) or go to the nearest hospital. This is a medical emergency that requires immediate professional attention. Do not delay!"
      : generateAIResponse(content, category || session.category);
    
    session.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      sentiment: isEmergency ? 'urgent' : 'neutral'
    });
    
    session.lastActivity = new Date();
    
    await session.save();
    
    res.json({ 
      success: true, 
      session,
      isEmergency 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Archive chat session
exports.archiveChatSession = async (req, res) => {
  try {
    const session = await HealthChat.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'archived' },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }
    
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete chat session
exports.deleteChatSession = async (req, res) => {
  try {
    const session = await HealthChat.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }
    
    res.json({ success: true, message: 'Chat session deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get chat statistics
exports.getChatStats = async (req, res) => {
  try {
    const sessions = await HealthChat.find({ user: req.user._id });
    
    const stats = {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.status === 'active').length,
      archivedSessions: sessions.filter(s => s.status === 'archived').length,
      flaggedSessions: sessions.filter(s => s.flagged).length,
      totalMessages: sessions.reduce((sum, s) => sum + s.messageCount, 0),
      categoryCounts: {
        general: sessions.filter(s => s.category === 'general').length,
        symptoms: sessions.filter(s => s.category === 'symptoms').length,
        medication: sessions.filter(s => s.category === 'medication').length,
        emergency: sessions.filter(s => s.category === 'emergency').length,
        'mental-health': sessions.filter(s => s.category === 'mental-health').length,
        nutrition: sessions.filter(s => s.category === 'nutrition').length,
        exercise: sessions.filter(s => s.category === 'exercise').length
      }
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
