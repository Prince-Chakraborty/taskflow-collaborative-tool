'use client';

import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, joinBoard, leaveBoard } from '@/lib/socket';
import useBoardStore from '@/store/boardStore';
import useNotificationStore from '@/store/notificationStore';
import { Card, List } from '@/types';

const useSocket = (boardId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const {
    addCard,
    updateCard,
    removeCard,
    moveCard,
    addList,
    updateList,
    removeList,
  } = useBoardStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    socketRef.current = initSocket();

    if (boardId) {
      joinBoard(boardId);

      // Card moved
      socketRef.current.on('card_moved', (data: {
        cardId: string;
        fromListId: string;
        listId: string;
        position: number;
      }) => {
        moveCard(data.cardId, data.fromListId, data.listId, data.position);
        addNotification({
          message: 'A card was moved',
          type: 'info',
        });
      });

      // Card created
      socketRef.current.on('card_created', (data: { card: Card }) => {
        addCard(data.card.list_id, data.card);
        addNotification({
          message: `New card "${data.card.title}" was created`,
          type: 'success',
        });
      });

      // Card updated
      socketRef.current.on('card_updated', (data: { card: Card }) => {
        updateCard(data.card.id, data.card);
        addNotification({
          message: `Card "${data.card.title}" was updated`,
          type: 'info',
        });
      });

      // Card deleted
      socketRef.current.on('card_deleted', (data: {
        cardId: string;
        listId: string;
      }) => {
        removeCard(data.cardId, data.listId);
        addNotification({
          message: 'A card was deleted',
          type: 'warning',
        });
      });

      // List created
      socketRef.current.on('list_created', (data: { list: List }) => {
        addList({ ...data.list, cards: [] });
        addNotification({
          message: `New list "${data.list.name}" was created`,
          type: 'success',
        });
      });

      // List updated
      socketRef.current.on('list_updated', (data: {
        listId: string;
        list: Partial<List>;
      }) => {
        updateList(data.listId, data.list);
      });

      // List deleted
      socketRef.current.on('list_deleted', (data: { listId: string }) => {
        removeList(data.listId);
        addNotification({
          message: 'A list was deleted',
          type: 'warning',
        });
      });

      // Comment added
      socketRef.current.on('comment_added', (data: {
        cardId: string;
        comment: any;
      }) => {
        addNotification({
          message: `${data.comment.user_name} commented on a card`,
          type: 'info',
        });
      });
    }

    return () => {
      if (boardId) {
        leaveBoard(boardId);
      }
      if (socketRef.current) {
        socketRef.current.off('card_moved');
        socketRef.current.off('card_created');
        socketRef.current.off('card_updated');
        socketRef.current.off('card_deleted');
        socketRef.current.off('list_created');
        socketRef.current.off('list_updated');
        socketRef.current.off('list_deleted');
        socketRef.current.off('comment_added');
      }
    };
  }, [boardId]);

  return socketRef.current;
};

export default useSocket;
