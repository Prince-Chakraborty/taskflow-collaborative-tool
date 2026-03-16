'use client';

import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import BoardCard from './BoardCard';
import AddCard from './AddCard';
import { List } from '@/types';
import { boardAPI } from '@/lib/api';
import useBoardStore from '@/store/boardStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface BoardListProps {
  list: List;
  boardId: string;
  isDragging: boolean;
}

const COLUMN_COLORS: Record<string, string> = {
  'To Do': 'border-t-gray-400',
  'In Progress': 'border-t-blue-500',
  'Done': 'border-t-green-500',
  'Review': 'border-t-yellow-500',
  'Blocked': 'border-t-red-500',
};

const COLUMN_BADGE_COLORS: Record<string, string> = {
  'To Do': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Done': 'bg-green-100 text-green-700',
  'Review': 'bg-yellow-100 text-yellow-700',
  'Blocked': 'bg-red-100 text-red-700',
};

const BoardList = ({ list, boardId, isDragging }: BoardListProps) => {
  const { updateList, removeList } = useBoardStore();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [listName, setListName] = useState(list.name);

  const completedCards = (list.cards || []).filter(
    (c) => list.name === 'Done'
  ).length;
  const totalCards = list.cards?.length || 0;
  const progress = list.name === 'Done' ? 100 : list.name === 'In Progress' ? 50 : 0;
  const progressLabel = list.name === 'Done' ? `${totalCards}/${totalCards}` : `0/${totalCards}`;

  const columnColorClass = COLUMN_COLORS[list.name] || 'border-t-purple-500';
  const badgeColorClass = COLUMN_BADGE_COLORS[list.name] || 'bg-purple-100 text-purple-700';

  const handleUpdateList = async () => {
    if (!listName.trim() || listName === list.name) {
      setIsEditing(false);
      setListName(list.name);
      return;
    }
    try {
      await boardAPI.updateList(boardId, list.id, { name: listName });
      updateList(list.id, { name: listName });
      toast.success('List updated');
    } catch (err) {
      toast.error('Failed to update list');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteList = async () => {
    if (!confirm(`Delete "${list.name}" and all its cards?`)) return;
    try {
      await boardAPI.deleteList(boardId, list.id);
      removeList(list.id);
      toast.success('List deleted');
    } catch (err) {
      toast.error('Failed to delete list');
    }
    setIsMenuOpen(false);
  };

  return (
    <div className={cn(
      'flex-shrink-0 w-72 bg-white rounded-xl flex flex-col shadow-sm border border-gray-200 border-t-4',
      columnColorClass
    )}>
      {/* List Header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateList();
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                    setListName(list.name);
                  }
                }}
                className="flex-1 px-2 py-1 text-sm font-semibold bg-gray-50 border border-blue-400 rounded-lg outline-none"
                autoFocus
              />
              <button onClick={handleUpdateList} className="p-1 text-green-600 hover:bg-green-50 rounded">
                <Check size={14} />
              </button>
              <button
                onClick={() => { setIsEditing(false); setListName(list.name); }}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <h3 className="font-semibold text-gray-800 text-sm">{list.name}</h3>
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                badgeColorClass
              )}>
                {totalCards}
              </span>
            </div>
          )}

          {!isEditing && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreHorizontal size={15} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20">
                  <button
                    onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 size={13} /> Rename
                  </button>
                  <button
                    onClick={handleDeleteList}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={13} /> Delete List
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalCards > 0 && (
          <div className="mb-2 px-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">{list.name === 'Done' ? totalCards : 0}/{totalCards} done</span>
              <span className="text-xs text-gray-400">{list.name === 'Done' ? 100 : list.name === 'In Progress' ? 50 : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${list.name === 'Done' ? 'bg-green-500' : list.name === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'}`}
                style={{ width: `${list.name === 'Done' ? 100 : list.name === 'In Progress' ? 50 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Cards */}
      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-16 transition-colors rounded-lg mx-1',
              snapshot.isDraggingOver && 'bg-blue-50 ring-2 ring-blue-200 ring-inset'
            )}
          >
            {(list.cards || []).map((card, index) => (
              <BoardCard
                key={card.id}
                card={card}
                index={index}
                boardId={boardId}
              />
            ))}
            {(list.cards || []).length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <Plus size={14} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-400">No cards yet</p>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Card */}
      {isAddingCard ? (
        <AddCard
          listId={list.id}
          boardId={boardId}
          onClose={() => setIsAddingCard(false)}
        />
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          data-add-card
          className="flex items-center gap-2 mx-2 mb-2 px-3 py-2 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
        >
          <Plus size={15} className="group-hover:text-blue-600" />
          Add a card
        </button>
      )}
    </div>
  );
};

export default BoardList;
