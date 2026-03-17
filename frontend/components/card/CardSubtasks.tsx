'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cardAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Subtask {
  id: string;
  title: string;
  is_completed: boolean;
}

interface CardSubtasksProps {
  cardId: string;
}

const CardSubtasks = ({ cardId }: CardSubtasksProps) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    fetchSubtasks();
  }, [cardId]);

  const fetchSubtasks = async () => {
    try {
      const res = await cardAPI.getSubtasks(cardId);
      setSubtasks(res.data.data);
    } catch (err) {
      console.error('Failed to fetch subtasks');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsLoading(true);
    try {
      const res = await cardAPI.addSubtask(cardId, { title: newTitle.trim() });
      setSubtasks([...subtasks, res.data.data]);
      setNewTitle('');
      setIsAdding(false);
      toast.success('Subtask added');
    } catch (err) {
      toast.error('Failed to add subtask');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (subtaskId: string) => {
    try {
      const res = await cardAPI.toggleSubtask(subtaskId);
      setSubtasks(subtasks.map(s => s.id === subtaskId ? res.data.data : s));
    } catch (err) {
      toast.error('Failed to update subtask');
    }
  };

  const handleDelete = async (subtaskId: string) => {
    try {
      await cardAPI.deleteSubtask(subtaskId);
      setSubtasks(subtasks.filter(s => s.id !== subtaskId));
      toast.success('Subtask deleted');
    } catch (err) {
      toast.error('Failed to delete subtask');
    }
  };

  const completed = subtasks.filter(s => s.is_completed).length;
  const progress = subtasks.length > 0 ? (completed / subtasks.length) * 100 : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Check size={16} className="text-gray-600" />
          <h4 className="font-semibold text-gray-800 text-sm">
            Subtasks ({completed}/{subtasks.length})
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {subtasks.length > 0 && (
        <div className="mb-3">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}% complete</p>
        </div>
      )}

      {/* Subtasks List */}
      {isExpanded && (
        <div className="space-y-2 mb-3">
          {subtasks.length === 0 && !isAdding && (
            <p className="text-sm text-gray-400 text-center py-2">
              No subtasks yet. Click + to add one.
            </p>
          )}
          {subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2 group p-2 hover:bg-gray-50 rounded-lg">
              <button
                onClick={() => handleToggle(subtask.id)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  subtask.is_completed
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {subtask.is_completed && <Check size={10} className="text-white" />}
              </button>
              <span className={`text-sm flex-1 ${subtask.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {subtask.title}
              </span>
              <button
                onClick={() => handleDelete(subtask.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}

          {/* Add Subtask Form */}
          {isAdding && (
            <form onSubmit={handleAdd} className="flex items-center gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Subtask title..."
                className="flex-1 px-2 py-1.5 text-sm border border-blue-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-300"
                autoFocus
              />
              <button
                type="submit"
                disabled={!newTitle.trim() || isLoading}
                className="px-2 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setIsAdding(false); setNewTitle(''); }}
                className="px-2 py-1.5 text-gray-500 text-xs hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default CardSubtasks;
