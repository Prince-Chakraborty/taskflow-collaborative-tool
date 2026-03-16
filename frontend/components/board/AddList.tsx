'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { boardAPI } from '@/lib/api';
import useBoardStore from '@/store/boardStore';
import { emitListCreated } from '@/lib/socket';
import toast from 'react-hot-toast';

interface AddListProps {
  boardId: string;
}

const AddList = ({ boardId }: AddListProps) => {
  const { addList } = useBoardStore();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const response = await boardAPI.createList(boardId, { name: name.trim() });
      const newList = response.data.data;
      addList({ ...newList, cards: [] });

      emitListCreated({ boardId, list: newList });

      toast.success('List created!');
      setName('');
      setIsAdding(false);
    } catch (err) {
      toast.error('Failed to create list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsAdding(false);
      setName('');
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex-shrink-0 w-72 flex items-center gap-2 px-4 py-3 bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-blue-400 shadow-sm"
      >
        <Plus size={18} />
        <span className="font-medium">Add another list</span>
      </button>
    );
  }

  return (
    <div className="flex-shrink-0 w-72 bg-gray-100 rounded-xl p-3">
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter list name..."
          className="w-full px-3 py-2 text-sm bg-white border border-blue-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 placeholder-gray-400 mb-2"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Plus size={14} />
            {isLoading ? 'Adding...' : 'Add List'}
          </button>
          <button
            type="button"
            onClick={() => { setIsAdding(false); setName(''); }}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddList;
