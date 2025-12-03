// frontend/src/services/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join room
  joinRoom(roomId, userId, username, role) {
    if (this.socket) {
      this.socket.emit('join-room', { roomId, userId, username, role });
    }
  }

  // Start bidding
  startBidding(roomId, playerId) {
    if (this.socket) {
      this.socket.emit('start-bidding', { roomId, playerId });
    }
  }

  // Place bid
  placeBid(roomId, playerId, bidAmount, teamName, userId) {
    if (this.socket) {
      this.socket.emit('place-bid', { roomId, playerId, bidAmount, teamName, userId });
    }
  }

  // Sell player
  sellPlayer(roomId, playerId, soldPrice, teamId, teamName) {
    if (this.socket) {
      this.socket.emit('sell-player', { roomId, playerId, soldPrice, teamId, teamName });
    }
  }

  // Unsold player
  unsoldPlayer(roomId, playerId) {
    if (this.socket) {
      this.socket.emit('unsold-player', { roomId, playerId });
    }
  }

  // Send chat message
  sendMessage(roomId, message, username) {
    if (this.socket) {
      this.socket.emit('send-message', { roomId, message, username });
    }
  }

  // Listen to events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();