const { Server } = require('socket.io');
require('dotenv').config();

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Join a board room
    socket.on('join_board', (boardId) => {
      socket.join(`board:${boardId}`);
      console.log(`Socket ${socket.id} joined board:${boardId}`);
    });

    // Leave a board room
    socket.on('leave_board', (boardId) => {
      socket.leave(`board:${boardId}`);
      console.log(`Socket ${socket.id} left board:${boardId}`);
    });

    // Join a workspace room
    socket.on('join_workspace', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      console.log(`Socket ${socket.id} joined workspace:${workspaceId}`);
    });

    // Card moved event
    socket.on('card_moved', (data) => {
      socket.to(`board:${data.boardId}`).emit('card_moved', data);
    });

    // Card created event
    socket.on('card_created', (data) => {
      socket.to(`board:${data.boardId}`).emit('card_created', data);
    });

    // Card updated event
    socket.on('card_updated', (data) => {
      socket.to(`board:${data.boardId}`).emit('card_updated', data);
    });

    // Card deleted event
    socket.on('card_deleted', (data) => {
      socket.to(`board:${data.boardId}`).emit('card_deleted', data);
    });

    // Comment added event
    socket.on('comment_added', (data) => {
      socket.to(`board:${data.boardId}`).emit('comment_added', data);
    });

    // List created event
    socket.on('list_created', (data) => {
      socket.to(`board:${data.boardId}`).emit('list_created', data);
    });

    // List updated event
    socket.on('list_updated', (data) => {
      socket.to(`board:${data.boardId}`).emit('list_updated', data);
    });

    // List deleted event
    socket.on('list_deleted', (data) => {
      socket.to(`board:${data.boardId}`).emit('list_deleted', data);
    });

    // User typing indicator
    socket.on('typing', (data) => {
      socket.to(`board:${data.boardId}`).emit('typing', data);
    });

    // User online presence
    socket.on('user_online', (data) => {
      socket.to(`workspace:${data.workspaceId}`).emit('user_online', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };
