'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { cardAPI } from '@/lib/api';
import useNotificationStore from '@/store/notificationStore';
import useBoardStore from '@/store/boardStore';
import { emitCardCreated } from '@/lib/socket';
import toast from 'react-hot-toast';

interface AddCardProps {
  listId: string;
  boardId: string;
  onClose: () => void;
}

const AddCard = ({ listId, boardId, onClose }: AddCardProps) => {
  const { addCard } = useBoardStore();
  const { addNotification } = useNotificationStore();
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const response = await cardAPI.create({
        title: title.trim(),
        listId,
        boardId,
      });

      const newCard = response.data.data;
      addCard(listId, { ...newCard, checklists: [], comments: [], attachments: [] });

      emitCardCreated({ boardId, card: newCard });

      toast.success('Card created!');
      addNotification({ message: 'Card created successfully', type: 'success' });
      setTitle('');
      onClose();
    } catch (err) {
      toast.error('Failed to create card');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="mx-2 mb-2">
      <form onSubmit={handleSubmit}>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter card title..."
          className="w-full px-3 py-2 text-sm bg-white border border-blue-400 rounded-xl outline-none resize-none shadow-sm focus:ring-2 focus:ring-blue-300 text-gray-800 placeholder-gray-400"
          rows={3}
          autoFocus
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            type="submit"
            disabled={!title.trim() || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Plus size={14} />
            {isLoading ? 'Adding...' : 'Add Card'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCard;
