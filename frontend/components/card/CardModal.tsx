'use client';

import { useState, useEffect } from 'react';
import { X, Edit2, Check, Trash2, Calendar, Tag, User, AlertCircle } from 'lucide-react';
import { Card, User as UserType } from '@/types';
import { cardAPI, userAPI } from '@/lib/api';
import { cn, getPriorityColor, formatDate, isOverdue } from '@/lib/utils';
import Avatar from '@/components/common/Avatar';
import Loading from '@/components/common/Loading';
import CardChecklist from './CardChecklist';
import CardSubtasks from './CardSubtasks';
import CardComments from './CardComments';
import CardAttachments from './CardAttachments';
import useBoardStore from '@/store/boardStore';
import { emitCardUpdated, emitCardDeleted } from '@/lib/socket';
import toast from 'react-hot-toast';

interface CardModalProps {
  cardId: string;
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const LABELS = ['bug', 'feature', 'improvement', 'design', 'backend', 'frontend', 'documentation'];

const CardModal = ({ cardId, boardId, isOpen, onClose }: CardModalProps) => {
  const { updateCard, removeCard } = useBoardStore();
  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'checklist' | 'comments' | 'attachments'>('details');

  useEffect(() => {
    if (isOpen && cardId) {
      fetchCard();
      fetchUsers();
    }
  }, [cardId, isOpen]);

  const fetchCard = async () => {
    setIsLoading(true);
    try {
      const response = await cardAPI.getOne(cardId);
      const cardData = response.data.data;
      setCard(cardData);
      setTitle(cardData.title);
      setDescription(cardData.description || '');
    } catch (err) {
      toast.error('Failed to load card');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data.data);
    } catch (err) {}
  };

  const handleUpdateTitle = async () => {
    if (!title.trim() || title === card?.title) {
      setIsEditingTitle(false);
      setTitle(card?.title || '');
      return;
    }
    try {
      await cardAPI.update(cardId, { title });
      setCard((prev) => prev ? { ...prev, title } : null);
      updateCard(cardId, { title });
      emitCardUpdated({ boardId, card: { ...card!, title } });
      toast.success('Title updated');
    } catch (err) {
      toast.error('Failed to update title');
    } finally {
      setIsEditingTitle(false);
    }
  };

  const handleUpdateDesc = async () => {
    try {
      await cardAPI.update(cardId, { description });
      setCard((prev) => prev ? { ...prev, description } : null);
      updateCard(cardId, { description });
      toast.success('Description updated');
    } catch (err) {
      toast.error('Failed to update description');
    } finally {
      setIsEditingDesc(false);
    }
  };

  const handleUpdateField = async (field: string, value: any) => {
    try {
      await cardAPI.update(cardId, { [field]: value });
      setCard((prev) => prev ? { ...prev, [field]: value } : null);
      updateCard(cardId, { [field]: value });
      emitCardUpdated({ boardId, card: { ...card!, [field]: value } });
      toast.success('Card updated');
    } catch (err) {
      toast.error('Failed to update card');
    }
  };

  const handleToggleLabel = async (label: string) => {
    const currentLabels = card?.labels || [];
    const newLabels = currentLabels.includes(label)
      ? currentLabels.filter((l) => l !== label)
      : [...currentLabels, label];
    await handleUpdateField('labels', newLabels);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this card?')) return;
    try {
      await cardAPI.delete(cardId);
      removeCard(cardId, card!.list_id);
      emitCardDeleted({ boardId, cardId, listId: card!.list_id });
      toast.success('Card deleted');
      onClose();
    } catch (err) {
      toast.error('Failed to delete card');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-in fade-in zoom-in-95 duration-200">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loading size="lg" text="Loading card..." />
          </div>
        ) : card ? (
          <>
            {/* Header */}
            <div className="flex items-start gap-3 p-5 border-b border-gray-100">
              <div className="flex-1">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateTitle();
                        if (e.key === 'Escape') { setIsEditingTitle(false); setTitle(card.title); }
                      }}
                      className="flex-1 text-lg font-semibold border border-blue-400 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-300"
                      autoFocus
                    />
                    <button onClick={handleUpdateTitle} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                      <Check size={16} />
                    </button>
                    <button onClick={() => { setIsEditingTitle(false); setTitle(card.title); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h2 className="text-lg font-semibold text-gray-800">{card.title}</h2>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 rounded transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  in <span className="font-medium">{card.list_name}</span>
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-5">
                {/* Tabs */}
                <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
                  {(['details', 'subtasks', 'checklist', 'comments', 'attachments'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors',
                        activeTab === tab
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      )}
                    >
                      {tab}
                      {tab === 'comments' && card.comments?.length > 0 && (
                        <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-1.5 rounded-full">
                          {card.comments.length}
                        </span>
                      )}
                      {tab === 'checklist' && card.checklists?.length > 0 && (
                        <span className="ml-1 bg-green-100 text-green-700 text-xs px-1.5 rounded-full">
                          {card.checklists.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                    {isEditingDesc ? (
                      <div>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-blue-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-300 resize-none text-gray-900 bg-white"
                          rows={4}
                          placeholder="Add a description..."
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button onClick={handleUpdateDesc} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 font-medium">
                            Save
                          </button>
                          <button onClick={() => { setIsEditingDesc(false); setDescription(card.description || ''); }} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 text-xs rounded-lg">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setIsEditingDesc(true)}
                        className="min-h-16 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        {card.description ? (
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{card.description}</p>
                        ) : (
                          <p className="text-sm text-gray-400">Click to add a description...</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Subtasks Tab */}
                {activeTab === 'subtasks' && card && (
                  <CardSubtasks cardId={card.id} />
                )}

                {/* Checklist Tab */}
                {activeTab === 'checklist' && (
                  <CardChecklist
                    cardId={cardId}
                    checklists={card.checklists || []}
                    onUpdate={(checklists) => setCard((prev) => prev ? { ...prev, checklists } : null)}
                  />
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <CardComments
                    cardId={cardId}
                    boardId={boardId}
                    comments={card.comments || []}
                    onUpdate={(comments) => setCard((prev) => prev ? { ...prev, comments } : null)}
                  />
                )}

                {/* Attachments Tab */}
                {activeTab === 'attachments' && (
                  <CardAttachments
                    cardId={cardId}
                    attachments={card.attachments || []}
                    onUpdate={(attachments) => setCard((prev) => prev ? { ...prev, attachments } : null)}
                  />
                )}
              </div>

              {/* Sidebar */}
              <div className="w-52 border-l border-gray-100 p-4 space-y-4">
                {/* Priority */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <AlertCircle size={11} /> Priority
                  </label>
                  <div className="space-y-1">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleUpdateField('priority', p)}
                        className={cn(
                          'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border',
                          card.priority === p
                            ? getPriorityColor(p)
                            : 'text-gray-500 hover:bg-gray-50 border-transparent'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <Calendar size={11} /> Due Date
                  </label>
                  <input
                    type="date"
                    value={card.due_date ? card.due_date.split('T')[0] : ''}
                    onChange={(e) => handleUpdateField('dueDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {card.due_date && isOverdue(card.due_date) && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> Overdue
                    </p>
                  )}
                </div>

                {/* Assignee */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <User size={11} /> Assignee
                  </label>
                  <select
                    value={card.assigned_to || ''}
                    onChange={(e) => handleUpdateField('assignedTo', e.target.value || null)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  {card.assigned_to_name && (
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar name={card.assigned_to_name} avatar={card.assigned_to_avatar} size="xs" />
                      <span className="text-xs text-gray-600">{card.assigned_to_name}</span>
                    </div>
                  )}
                </div>

                {/* Labels */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <Tag size={11} /> Labels
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {LABELS.map((label) => (
                      <button
                        key={label}
                        onClick={() => handleToggleLabel(label)}
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full border transition-colors capitalize',
                          card.labels?.includes(label)
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Created by */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Created by
                  </label>
                  <div className="flex items-center gap-2">
                    <Avatar name={card.created_by_name || 'User'} size="xs" />
                    <span className="text-xs text-gray-600">{card.created_by_name}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CardModal;
