import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinBoard = (boardId: string): void => {
  if (socket) {
    socket.emit('join_board', boardId);
  }
};

export const leaveBoard = (boardId: string): void => {
  if (socket) {
    socket.emit('leave_board', boardId);
  }
};

export const joinWorkspace = (workspaceId: string): void => {
  if (socket) {
    socket.emit('join_workspace', workspaceId);
  }
};

export const emitCardMoved = (data: {
  boardId: string;
  cardId: string;
  listId: string;
  position: number;
}): void => {
  if (socket) {
    socket.emit('card_moved', data);
  }
};

export const emitCardCreated = (data: {
  boardId: string;
  card: any;
}): void => {
  if (socket) {
    socket.emit('card_created', data);
  }
};

export const emitCardUpdated = (data: {
  boardId: string;
  card: any;
}): void => {
  if (socket) {
    socket.emit('card_updated', data);
  }
};

export const emitCardDeleted = (data: {
  boardId: string;
  cardId: string;
  listId: string;
}): void => {
  if (socket) {
    socket.emit('card_deleted', data);
  }
};

export const emitCommentAdded = (data: {
  boardId: string;
  cardId: string;
  comment: any;
}): void => {
  if (socket) {
    socket.emit('comment_added', data);
  }
};

export const emitListCreated = (data: {
  boardId: string;
  list: any;
}): void => {
  if (socket) {
    socket.emit('list_created', data);
  }
};

export const emitListDeleted = (data: {
  boardId: string;
  listId: string;
}): void => {
  if (socket) {
    socket.emit('list_deleted', data);
  }
};

export default socket;
