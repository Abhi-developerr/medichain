import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MessageCircle, Plus, Send, Archive, Trash2, X, Bot, User as UserIcon, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function AIHealthAssistant() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSessions();
    loadStats();
  }, []);

  useEffect(() => {
    if (activeSession) {
      scrollToBottom();
    }
  }, [activeSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      const { data } = await axios.get('/api/health-chat');
      setSessions(Array.isArray(data.sessions) ? data.sessions : []);
    } catch (error) {
      toast.error('Failed to load chat sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await axios.get('/api/health-chat/stats');
      setStats(data.stats || {});
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const { data } = await axios.get(`/api/health-chat/${sessionId}`);
      setActiveSession(data.session);
    } catch (error) {
      toast.error('Failed to load session');
    }
  };

  const createNewSession = async (category = 'general') => {
    try {
      const { data } = await axios.post('/api/health-chat', {
        title: 'New Conversation',
        category,
        initialMessage: 'Hello! I need help with my health.'
      });
      setActiveSession(data.session);
      loadSessions();
      loadStats();
    } catch (error) {
      toast.error('Failed to create session');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeSession) return;

    setSending(true);
    const userMessage = message;
    setMessage('');

    try {
      const { data } = await axios.post(`/api/health-chat/${activeSession._id}/message`, {
        content: userMessage,
        category: activeSession.category
      });
      
      setActiveSession(data.session);
      
      if (data.isEmergency) {
        toast.error('⚠️ EMERGENCY DETECTED! Please seek immediate medical attention!', {
          duration: 10000
        });
      }
    } catch (error) {
      toast.error('Failed to send message');
      setMessage(userMessage); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const archiveSession = async (sessionId) => {
    try {
      await axios.put(`/api/health-chat/${sessionId}/archive`);
      toast.success('Session archived');
      if (activeSession?._id === sessionId) setActiveSession(null);
      loadSessions();
    } catch (error) {
      toast.error('Failed to archive');
    }
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await axios.delete(`/api/health-chat/${sessionId}`);
      toast.success('Session deleted');
      if (activeSession?._id === sessionId) setActiveSession(null);
      loadSessions();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-100 text-blue-700',
      symptoms: 'bg-red-100 text-red-700',
      medication: 'bg-purple-100 text-purple-700',
      emergency: 'bg-red-600 text-white',
      'mental-health': 'bg-green-100 text-green-700',
      nutrition: 'bg-yellow-100 text-yellow-700',
      exercise: 'bg-orange-100 text-orange-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI Health Assistant
          </h1>
          <p className="text-gray-600">Get instant health guidance powered by AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Sessions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Conversations</h2>
                <button
                  onClick={() => createNewSession()}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Categories */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => createNewSession('symptoms')}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100"
                >
                  Symptoms
                </button>
                <button
                  onClick={() => createNewSession('medication')}
                  className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-xs hover:bg-purple-100"
                >
                  Medication
                </button>
                <button
                  onClick={() => createNewSession('nutrition')}
                  className="px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-xs hover:bg-yellow-100"
                >
                  Nutrition
                </button>
                <button
                  onClick={() => createNewSession('mental-health')}
                  className="px-3 py-2 bg-green-50 text-green-600 rounded-lg text-xs hover:bg-green-100"
                >
                  Mental Health
                </button>
              </div>

              {/* Sessions List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <p className="text-center text-gray-500 text-sm">Loading...</p>
                ) : sessions.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm">No conversations yet</p>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session._id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        activeSession?._id === session._id
                          ? 'bg-blue-100 border-2 border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => loadSession(session._id)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm text-gray-900 line-clamp-1">
                          {session.title}
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); archiveSession(session._id); }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Archive className="h-3 w-3 text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteSession(session._id); }}
                            className="p-1 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(session.category)}`}>
                          {session.category}
                        </span>
                        {session.flagged && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-md p-4 mt-4">
              <h3 className="font-bold text-gray-900 mb-3">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Chats:</span>
                  <span className="font-bold">{stats.totalSessions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Messages:</span>
                  <span className="font-bold">{stats.totalMessages || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Flagged:</span>
                  <span className="font-bold text-red-600">{stats.flaggedSessions || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            {!activeSession ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Start a Conversation</h3>
                <p className="text-gray-600 mb-6">Select a chat or start a new one to get health guidance</p>
                <button
                  onClick={() => createNewSession()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg"
                >
                  New Conversation
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="border-b p-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-900">{activeSession.title}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(activeSession.category)}`}>
                      {activeSession.category}
                    </span>
                  </div>
                  {activeSession.flagged && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      Emergency Detected
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeSession.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role !== 'user' && msg.role !== 'system' && (
                        <div className="bg-blue-100 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      <div
                        className={`max-w-md px-4 py-2 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : msg.role === 'system'
                            ? 'bg-gray-100 text-gray-600 text-sm italic'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="bg-purple-100 p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-5 w-5 text-purple-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="border-t p-4 flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your health question..."
                    className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-bold mb-1">Important Disclaimer</p>
              <p>
                This AI assistant provides general health information only and is not a substitute for professional medical advice, 
                diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions 
                you may have regarding a medical condition. If you think you have a medical emergency, call emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
