import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(userId) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      if (userId) {
        this.socket.emit('user:join', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('📴 Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join with user ID
  joinUser(userId) {
    if (this.socket) {
      this.socket.emit('user:join', userId);
    }
  }

  // Send message
  sendMessage(receiverId, message) {
    if (this.socket) {
      this.socket.emit('message:send', { receiverId, message });
    }
  }

  // Listen for incoming messages
  onMessageReceive(callback) {
    if (this.socket) {
      this.socket.on('message:receive', callback);
    }
  }

  // Listen for message sent confirmation
  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message:sent', callback);
    }
  }

  // Typing indicators
  startTyping(receiverId) {
    if (this.socket) {
      this.socket.emit('typing:start', receiverId);
    }
  }

  stopTyping(receiverId) {
    if (this.socket) {
      this.socket.emit('typing:stop', receiverId);
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.on('typing:user', callback);
    }
  }

  // Mark message as read
  markAsRead(messageId, senderId) {
    if (this.socket) {
      this.socket.emit('message:read', { messageId, senderId });
    }
  }

  onMessageRead(callback) {
    if (this.socket) {
      this.socket.on('message:read', callback);
    }
  }

  // Online users
  onOnlineUsers(callback) {
    if (this.socket) {
      this.socket.on('users:online', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();
