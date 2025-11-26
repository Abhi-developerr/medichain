import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import { MessageCircle, Send, Search, User, Circle, CheckCheck, Phone, Video, MoreVertical, Image, Paperclip, Smile, Plus, X } from 'lucide-react';

const MessagesRealtime = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Connect socket
    socketService.connect(user._id);
    socketService.joinUser(user._id);

    // Fetch initial data
    fetchConversations();
    fetchAllUsers();

    // Listen for incoming messages
    socketService.onMessageReceive((message) => {
      console.log('📨 Message received:', message);
      
      // Add to messages if from selected user
      if (selectedUser && message.sender === selectedUser._id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
        
        // Mark as read
        socketService.markAsRead(message._id, message.sender);
      }
      
      // Update conversations
      fetchConversations();
    });

    // Listen for message sent confirmation
    socketService.onMessageSent((message) => {
      console.log('✅ Message sent:', message);
    });

    // Listen for typing indicators
    socketService.onTyping(({ userId, typing: isTyping }) => {
      if (selectedUser && userId === selectedUser._id) {
        setTyping(isTyping ? selectedUser.name : null);
        if (isTyping) {
          setTimeout(() => setTyping(null), 3000);
        }
      }
    });

    // Listen for online users
    socketService.onOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [user._id, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(Array.isArray(response.data.conversations) ? response.data.conversations : []);
    } catch (error) {
      console.error('Failed to fetch conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const [doctorsRes, patientsRes] = await Promise.all([
        api.get('/auth/doctors'),
        api.get('/auth/patients')
      ]);
      
      const doctors = Array.isArray(doctorsRes.data.doctors) ? doctorsRes.data.doctors : [];
      const patients = Array.isArray(patientsRes.data.patients) ? patientsRes.data.patients : [];
      
      // Combine and filter out current user
      const users = [...doctors, ...patients].filter(u => u._id !== user._id);
      setAllUsers(users);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await api.get(`/messages/conversation/${userId}`);
      setMessages(Array.isArray(response.data.messages) ? response.data.messages : []);
      
      // Mark messages as read
      const unreadMessages = response.data.messages.filter(m => !m.isRead && m.sender === userId);
      unreadMessages.forEach(msg => {
        api.put(`/messages/${msg._id}/read`).catch(console.error);
      });
    } catch (error) {
      toast.error('Failed to load messages');
      setMessages([]);
    }
  };

  const handleSelectUser = (otherUser) => {
    setSelectedUser(otherUser);
    setShowNewChat(false);
    fetchMessages(otherUser._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser) return;

    const tempMessage = {
      _id: Date.now(),
      sender: user._id,
      recipient: selectedUser._id,
      message: messageText,
      createdAt: new Date(),
      isRead: false,
      sending: true
    };

    setMessages(prev => [...prev, tempMessage]);
    const text = messageText;
    setMessageText('');
    scrollToBottom();

    try {
      const response = await api.post('/messages', {
        recipient: selectedUser._id,
        message: text
      });

      // Update temp message with real one
      setMessages(prev => prev.map(m => 
        m._id === tempMessage._id ? response.data.message : m
      ));

      // Emit via socket for real-time delivery
      socketService.sendMessage(selectedUser._id, response.data.message);
      
      fetchConversations();
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    
    if (!selectedUser) return;

    // Notify other user of typing
    socketService.startTyping(selectedUser._id);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(selectedUser._id);
    }, 2000);
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now - messageDate;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return messageDate.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                    Messages
                  </h2>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="New Chat"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.otherUser._id}
                      onClick={() => handleSelectUser(conv.otherUser)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                        selectedUser?._id === conv.otherUser._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {conv.otherUser.name?.charAt(0).toUpperCase()}
                        </div>
                        {isUserOnline(conv.otherUser._id) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{conv.otherUser.name}</h3>
                          {conv.lastMessage && (
                            <span className="text-xs text-gray-500">{formatTime(conv.lastMessage.createdAt)}</span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage.sender === user._id && '✓ '}
                            {conv.lastMessage.message}
                          </p>
                        )}
                        {conv.unreadCount > 0 && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {selectedUser.name?.charAt(0).toUpperCase()}
                        </div>
                        {isUserOnline(selectedUser._id) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
                        <p className="text-xs text-gray-500">
                          {isUserOnline(selectedUser._id) ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <Circle className="w-2 h-2 fill-current" /> Online
                            </span>
                          ) : (
                            'Offline'
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Video className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg, idx) => {
                      const isSent = msg.sender === user._id;
                      const showAvatar = idx === 0 || messages[idx - 1].sender !== msg.sender;
                      
                      return (
                        <div
                          key={msg._id}
                          className={`flex items-end gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {showAvatar && !isSent && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {selectedUser.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {!showAvatar && !isSent && <div className="w-8" />}
                          
                          <div className={`max-w-xs lg:max-w-md ${isSent ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isSent
                                  ? 'bg-blue-600 text-white rounded-br-sm'
                                  : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                              } ${msg.sending ? 'opacity-50' : ''}`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 px-2 ${isSent ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-gray-500">{formatTime(msg.createdAt)}</span>
                              {isSent && (
                                msg.isRead ? (
                                  <CheckCheck className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <CheckCheck className="w-3 h-3 text-gray-400" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {typing && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          {selectedUser.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Paperclip className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Image className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      <div className="flex-1">
                        <textarea
                          value={messageText}
                          onChange={handleTyping}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                          placeholder="Type a message..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows="1"
                          style={{ minHeight: '40px', maxHeight: '120px' }}
                        />
                      </div>
                      
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Smile className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Chat Modal */}
        {showNewChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Start New Chat</h3>
                <button
                  onClick={() => setShowNewChat(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Search Users */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No users found</p>
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => handleSelectUser(u)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        {isUserOnline(u._id) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-gray-900">{u.name}</h4>
                        <p className="text-sm text-gray-500 capitalize">{u.role}</p>
                      </div>
                      {isUserOnline(u._id) && (
                        <span className="text-xs text-green-600 font-medium">Online</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesRealtime;
