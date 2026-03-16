'use client';

import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, MessageSquare, Paperclip, CheckSquare, AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/types';
import { cn, formatDate, isOverdue, getLabelColor } from '@/lib/utils';
import Avatar from '@/components/common/Avatar';
import CardModal from '@/components/card/CardModal';

interface BoardCardProps {
  card: Card;
  index: number;
  boardId: string;
}

const PRIORITY_BORDER: Record<string, string> = {
  urgent: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-400',
  low: 'border-l-green-400',
};

const PRIORITY_BADGE: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const BoardCard = ({ card, index, boardId }: BoardCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const completedChecklists = card.checklists?.filter((c) => c.is_completed).length || 0;
  const totalChecklists = card.checklists?.length || 0;
  const checklistProgress = totalChecklists > 0 ? (completedChecklists / totalChecklists) * 100 : 0;

  const priorityBorder = PRIORITY_BORDER[card.priority] || 'border-l-gray-300';
  const priorityBadge = PRIORITY_BADGE[card.priority] || 'bg-gray-100 text-gray-600';

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setIsModalOpen(true)}
            className={cn(
              'bg-white rounded-xl p-3 shadow-sm border border-gray-100 border-l-4 cursor-pointer',
              'hover:shadow-md hover:border-l-4 transition-all duration-200 group',
              priorityBorder,
              snapshot.isDragging && 'shadow-2xl rotate-1 scale-105 border-blue-300'
            )}
          >
            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {card.labels.map((label) => (
                  <span
                    key={label}
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
                      getLabelColor(label)
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <p className="text-sm font-medium text-gray-800 mb-2.5 line-clamp-2 group-hover:text-blue-700 transition-colors leading-relaxed">
              {card.title}
            </p>

            {/* Checklist Progress */}
            {totalChecklists > 0 && (
              <div className="mb-2.5">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="flex items-center gap-1">
                    <CheckSquare size={10} />
                    {completedChecklists}/{totalChecklists}
                  </span>
                  <span>{Math.round(checklistProgress)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1">
                  <div
                    className={cn(
                      'h-1 rounded-full transition-all duration-300',
                      checklistProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
                    )}
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Due Date */}
            {card.due_date && (
              <div className={cn(
                'flex items-center gap-1 text-xs mb-2.5 px-2 py-1 rounded-lg w-fit font-medium',
                isOverdue(card.due_date)
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-gray-50 text-gray-600 border border-gray-100'
              )}>
                {isOverdue(card.due_date)
                  ? <AlertCircle size={10} />
                  : <Calendar size={10} />
                }
                {formatDate(card.due_date)}
                {isOverdue(card.due_date) && (
                  <span className="ml-1 font-semibold">Overdue!</span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                {/* Priority Badge */}
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
                  priorityBadge
                )}>
                  {card.priority}
                </span>

                {/* Comments */}
                {card.comments && card.comments.length > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-gray-400">
                    <MessageSquare size={10} />
                    {card.comments.length}
                  </span>
                )}

                {/* Attachments */}
                {card.attachments && card.attachments.length > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-gray-400">
                    <Paperclip size={10} />
                    {card.attachments.length}
                  </span>
                )}
              </div>

              {/* Assignee */}
              {card.assigned_to_name && (
                <Avatar
                  name={card.assigned_to_name}
                  avatar={card.assigned_to_avatar}
                  size="xs"
                />
              )}
            </div>
          </div>
        )}
      </Draggable>

      {/* Card Modal */}
      {isModalOpen && (
        <CardModal
          cardId={card.id}
          boardId={boardId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default BoardCard;
