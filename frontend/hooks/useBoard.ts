import { useState } from 'react';
import { boardAPI, cardAPI } from '@/lib/api';
import useBoardStore from '@/store/boardStore';
import toast from 'react-hot-toast';

const useBoard = () => {
  const { addCard, updateCard, removeCard, addList, updateList, removeList } = useBoardStore();
  const [isLoading, setIsLoading] = useState(false);

  const createCard = async (title: string, listId: string, boardId: string) => {
    setIsLoading(true);
    try {
      const response = await cardAPI.create({ title, listId, boardId });
      const newCard = response.data.data;
      addCard(listId, { ...newCard, checklists: [], comments: [], attachments: [] });
      toast.success('Card created!');
      return newCard;
    } catch (err) {
      toast.error('Failed to create card');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCard = async (cardId: string, listId: string, boardId: string) => {
    try {
      await cardAPI.delete(cardId);
      removeCard(cardId, listId);
      toast.success('Card deleted!');
    } catch (err) {
      toast.error('Failed to delete card');
    }
  };

  const createList = async (name: string, boardId: string) => {
    setIsLoading(true);
    try {
      const response = await boardAPI.createList(boardId, { name });
      const newList = response.data.data;
      addList({ ...newList, cards: [] });
      toast.success('List created!');
      return newList;
    } catch (err) {
      toast.error('Failed to create list');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteList = async (listId: string, boardId: string) => {
    try {
      await boardAPI.deleteList(boardId, listId);
      removeList(listId);
      toast.success('List deleted!');
    } catch (err) {
      toast.error('Failed to delete list');
    }
  };

  return {
    isLoading,
    createCard,
    deleteCard,
    createList,
    deleteList,
  };
};

export default useBoard;
