'use client';

import { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { Checklist } from '@/types';
import { cardAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CardChecklistProps {
  cardId: string;
  checklists: Checklist[];
  onUpdate: (checklists: Checklist[]) => void;
}

const CardChecklist = ({ cardId, checklists, onUpdate }: CardChecklistProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const completedCount = checklists.filter((c) => c.is_completed).length;
  const progress = checklists.length > 0 ? (completedCount / checklists.length) * 100 : 0;

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    setIsLoading(true);
    try {
      const response = await cardAPI.addChecklist(cardId, { title: newItem.trim() });
      onUpdate([...checklists, response.data.data]);
      setNewItem('');
      setIsAdding(false);
      toast.success('Item added');
    } catch (err) {
      toast.error('Failed to add item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (item: Checklist) => {
    try {
      await cardAPI.updateChecklist(cardId, item.id, {
        isCompleted: !item.is_completed,
      });
      onUpdate(
        checklists.map((c) =>
          c.id === item.id ? { ...c, is_completed: !c.is_completed } : c
        )
      );
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await cardAPI.deleteChecklist(cardId, itemId);
      onUpdate(checklists.filter((c) => c.id !== itemId));
      toast.success('Item deleted');
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h4 className="font-semibold text-gray-800 text-sm">Checklist</h4>
          <span className="text-xs text-gray-500">
            {completedCount}/{checklists.length}
          </span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <Plus size={12} /> Add item
        </button>
      </div>

      {/* Progress Bar */}
      {checklists.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                progress === 100 ? 'bg-green-500' : 'bg-blue-500'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Items */}
      <div className="space-y-1.5">
        {checklists.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 group p-1.5 rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={item.is_completed}
              onChange={() => handleToggle(item)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
            />
            <span
              className={cn(
                'flex-1 text-sm',
                item.is_completed ? 'line-through text-gray-400' : 'text-gray-700'
              )}
            >
              {item.title}
            </span>
            <button
              onClick={() => handleDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Item Form */}
      {isAdding && (
        <form onSubmit={handleAddItem} className="mt-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add an item..."
            className="w-full px-3 py-2 text-sm border border-blue-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-300 mb-2 text-gray-900 bg-white"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!newItem.trim() || isLoading}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setNewItem(''); }}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <X size={14} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CardChecklist;
