import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MessageCircle, Send, Search, User, Circle, CheckCheck, Paperclip, X } from 'lucide-react';

const Messages = () => {
  const { API_URL, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation.otherUser._id, true);
      }
      fetchUnreadCount();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/messages/conversations`);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Fetch conversations error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Please log in to view messages');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch conversations');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages/unread-count`);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count');
    }
  };

  const fetchMessages = async (userId, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await axios.get(`${API_URL}/messages/conversation/${userId}`);
      setMessages(response.data.messages);
      
      // Mark as selected
      const conv = conversations.find(c => c.otherUser._id === userId);
      if (conv) {
        setSelectedConversation(conv);
        // Update conversation unread count
        setConversations(prev => prev.map(c => 
          c.otherUser._id === userId ? { ...c, unreadCount: 0 } : c
        ));
        fetchUnreadCount();
      }
    } catch (error) {
      if (!silent) toast.error('Failed to fetch messages');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await axios.post(`${API_URL}/messages`, {
        recipient: selectedConversation.otherUser._id,
        message: messageText
      });
      setMessageText('');
      fetchMessages(selectedConversation.otherUser._id, true);
      fetchConversations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 mb-2 flex items-center gap-3">
            <MessageCircle className="h-10 w-10 text-cyan-600" />
            Messages
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600">Communicate with {user.role === 'patient' ? 'your doctors' : 'your patients'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {loading && conversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv, index) => (
                  <div
                    key={conv.otherUser._id}
                    onClick={() => fetchMessages(conv.otherUser._id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all animate-slide-up ${
                      selectedConversation?.otherUser._id === conv.otherUser._id ? 'bg-cyan-50' : ''
                    }`}
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          {conv.otherUser.name.charAt(0)}
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{conv.unreadCount}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {user.role === 'patient' ? 'Dr. ' : ''}{conv.otherUser.name}
                          </h3>
                          {conv.lastMessage && (
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conv.lastMessage?.message || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                      {selectedConversation.otherUser.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">
                        {user.role === 'patient' ? 'Dr. ' : ''}{selectedConversation.otherUser.name}
                      </h3>
                      <p className="text-xs text-white/80">{selectedConversation.otherUser.specialization || selectedConversation.otherUser.email}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 to-cyan-50/30">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isOwn = message.sender._id === user._id;
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
                          style={{animationDelay: `${index * 0.02}s`}}
                        >
                          <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-2xl px-4 py-3 ${
                                isOwn
                                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm break-words">{message.message}</p>
                              {message.attachment && (
                                <div className="mt-2 flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                                  <Paperclip className="h-4 w-4" />
                                  <span className="text-xs">{message.attachment.fileName}</span>
                                </div>
                              )}
                            </div>
                            <div className={`flex items-center gap-2 mt-1 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-gray-500">
                                {new Date(message.createdAt).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {isOwn && (
                                message.isRead ? (
                                  <CheckCheck className="h-3 w-3 text-cyan-600" />
                                ) : (
                                  <Circle className="h-2 w-2 text-gray-400 fill-current" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
