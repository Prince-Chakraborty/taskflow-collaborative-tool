'use client';

import { useState, useEffect } from 'react';
import { initSocket } from '@/lib/socket';
import useAuthStore from '@/store/authStore';
import Avatar from '@/components/common/Avatar';

interface OnlineUser {
  userId: string;
  userName: string;
  userAvatar?: string;
}

interface OnlineUsersProps {
  boardId: string;
  workspaceId: string;
}

const OnlineUsers = ({ boardId, workspaceId }: OnlineUsersProps) => {
  const { user } = useAuthStore();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    const socket = initSocket();

    // Announce presence
    if (user) {
      socket.emit('user_online', {
        workspaceId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
      });
    }

    // Listen for online users
    socket.on('user_online', (data: OnlineUser) => {
      setOnlineUsers((prev) => {
        const exists = prev.find((u) => u.userId === data.userId);
        if (exists) return prev;
        return [...prev, data];
      });
    });

    socket.on('user_offline', (data: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    return () => {
      socket.off('user_online');
      socket.off('user_offline');
    };
  }, [boardId, user]);

  if (onlineUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-400 mr-1">Online:</span>
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 5).map((onlineUser) => (
          <div
            key={onlineUser.userId}
            className="relative group"
          >
            <div className="ring-2 ring-gray-800 rounded-full">
              <Avatar
                name={onlineUser.userName}
                avatar={onlineUser.userAvatar}
                size="xs"
              />
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {onlineUser.userName}
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-1 ring-gray-900" />
          </div>
        ))}
        {onlineUsers.length > 5 && (
          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs ring-2 ring-gray-800">
            +{onlineUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
