import { create } from 'zustand';
import { Board, List, Card } from '@/types';

interface BoardStore {
  board: Board | null;
  lists: List[];
  isLoading: boolean;
  setBoard: (board: Board) => void;
  setLists: (lists: List[]) => void;
  setLoading: (isLoading: boolean) => void;

  // List actions
  addList: (list: List) => void;
  updateList: (listId: string, data: Partial<List>) => void;
  removeList: (listId: string) => void;

  // Card actions
  addCard: (listId: string, card: Card) => void;
  updateCard: (cardId: string, data: Partial<Card>) => void;
  removeCard: (cardId: string, listId: string) => void;
  moveCard: (
    cardId: string,
    fromListId: string,
    toListId: string,
    newPosition: number
  ) => void;
}

const useBoardStore = create<BoardStore>((set) => ({
  board: null,
  lists: [],
  isLoading: true,

  setBoard: (board: Board) =>
    set({ board, lists: board.lists || [], isLoading: false }),

  setLists: (lists: List[]) => set({ lists }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  // List actions
  addList: (list: List) =>
    set((state) => ({
      lists: [...state.lists, { ...list, cards: [] }],
    })),

  updateList: (listId: string, data: Partial<List>) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId ? { ...list, ...data } : list
      ),
    })),

  removeList: (listId: string) =>
    set((state) => ({
      lists: state.lists.filter((list) => list.id !== listId),
    })),

  // Card actions
  addCard: (listId: string, card: Card) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? { ...list, cards: [...(list.cards || []), card] }
          : list
      ),
    })),

  updateCard: (cardId: string, data: Partial<Card>) =>
    set((state) => ({
      lists: state.lists.map((list) => ({
        ...list,
        cards: (list.cards || []).map((card) =>
          card.id === cardId ? { ...card, ...data } : card
        ),
      })),
    })),

  removeCard: (cardId: string, listId: string) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              cards: (list.cards || []).filter((card) => card.id !== cardId),
            }
          : list
      ),
    })),

  moveCard: (
    cardId: string,
    fromListId: string,
    toListId: string,
    newPosition: number
  ) =>
    set((state) => {
      const fromList = state.lists.find((l) => l.id === fromListId);
      const card = fromList?.cards?.find((c) => c.id === cardId);

      if (!card) return state;

      const newLists = state.lists.map((list) => {
        if (list.id === fromListId) {
          return {
            ...list,
            cards: (list.cards || []).filter((c) => c.id !== cardId),
          };
        }
        if (list.id === toListId) {
          const newCards = [...(list.cards || [])];
          newCards.splice(newPosition, 0, { ...card, list_id: toListId });
          return { ...list, cards: newCards };
        }
        return list;
      });

      return { lists: newLists };
    }),
}));

export default useBoardStore;
