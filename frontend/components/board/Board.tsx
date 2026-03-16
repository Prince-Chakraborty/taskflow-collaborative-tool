'use client';

import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import BoardList from './BoardList';
import AddList from './AddList';
import useBoardStore from '@/store/boardStore';
import { cardAPI } from '@/lib/api';
import { emitCardMoved } from '@/lib/socket';
import toast from 'react-hot-toast';

interface BoardProps {
  boardId: string;
  priorityFilter?: string;
}

const Board = ({ boardId, priorityFilter = 'all' }: BoardProps) => {
  const { lists, moveCard } = useBoardStore();
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = () => setIsDragging(true);

  const onDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Optimistic update
    moveCard(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );

    try {
      await cardAPI.move(draggableId, {
        listId: destination.droppableId,
        position: destination.index,
      });

      emitCardMoved({
        boardId,
        cardId: draggableId,
        listId: destination.droppableId,
        position: destination.index,
      });
    } catch (err) {
      toast.error('Failed to move card');
      window.location.reload();
    }
  };

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 items-start pb-4 min-w-max">
        {lists.map((list) => {
          const filteredList = priorityFilter === 'all' ? list : {
            ...list,
            cards: list.cards?.filter(c => c.priority === priorityFilter) || []
          };
          return (
          <BoardList
            key={list.id}
            list={filteredList}
            boardId={boardId}
            isDragging={isDragging}
          />
        );
        })}
        <AddList boardId={boardId} />
      </div>
    </DragDropContext>
  );
};

export default Board;
