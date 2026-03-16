'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, LayoutDashboard, Trash2, ArrowLeft } from 'lucide-react';
import { boardAPI, workspaceAPI } from '@/lib/api';
import { Board, Workspace } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Loading from '@/components/common/Loading';
import { BoardSkeleton } from '@/components/common/Skeleton';
import useAuth from '@/hooks/useAuth';
import { boardColors } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoard, setNewBoard] = useState({ name: '', description: '', backgroundColor: '#0079BF' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated && workspaceId) fetchData();
  }, [isAuthenticated, workspaceId]);

  const fetchData = async () => {
    try {
      const [workspaceRes, boardsRes] = await Promise.all([
        workspaceAPI.getOne(workspaceId as string),
        boardAPI.getByWorkspace(workspaceId as string),
      ]);
      setWorkspace(workspaceRes.data.data);
      setBoards(boardsRes.data.data);
    } catch (err) {
      toast.error('Failed to load workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoard.name.trim()) return;
    setIsCreating(true);
    try {
      const response = await boardAPI.create({ ...newBoard, workspaceId: workspaceId as string });
      setBoards([...boards, response.data.data]);
      setNewBoard({ name: '', description: '', backgroundColor: '#0079BF' });
      setShowCreateModal(false);
      toast.success('Board created!');
    } catch (err) {
      toast.error('Failed to create board');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm('Delete this board and all its cards?')) return;
    try {
      await boardAPI.delete(boardId);
      setBoards(boards.filter((b) => b.id !== boardId));
      toast.success('Board deleted');
    } catch (err) {
      toast.error('Failed to delete board');
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      <div style={{ marginLeft: "256px", paddingTop: "56px", paddingLeft: "16px", paddingRight: "16px" }}>
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {workspace?.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{workspace?.name}</h1>
              {workspace?.description && (
                <p className="text-sm text-gray-500">{workspace.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
          >
            <Plus size={16} />
            New Board
          </button>
        </div>

        {/* Boards Grid */}
        <div className="p-8">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <BoardSkeleton key={i} />)}
            </div>
          )}
          {boards.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="text-gray-400" size={36} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No boards yet</h3>
              <p className="text-gray-500 text-sm mb-4">Create your first board to start managing tasks</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm"
              >
                Create Board
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-2">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="relative rounded-2xl cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-200 h-32"
                  style={{ backgroundColor: board.background_color }}
                  onClick={() => router.push(`/board/${board.id}`)}
                >
                  <div className="p-5 h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-white text-base line-clamp-2 flex-1 pl-2">
                        {board.name}
                      </h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteBoard(board.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-white bg-opacity-20 hover:bg-opacity-40 text-white rounded-lg transition-all ml-2 flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-black bg-opacity-20 text-white px-2 py-0.5 rounded-full font-medium">
                        {parseInt(String(board.list_count)) || 0} lists
                      </span>
                      <span className="text-xs bg-black bg-opacity-20 text-white px-2 py-0.5 rounded-full font-medium">
                        {parseInt(String(board.card_count)) || 0} cards
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" />
                </div>
              ))}

              {/* Create Board Card */}
              <div
                onClick={() => setShowCreateModal(true)}
                className="rounded-2xl border-2 border-dashed border-gray-300 h-32 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="text-center">
                  <Plus className="text-gray-400 group-hover:text-blue-500 mx-auto mb-1 transition-colors" size={24} />
                  <p className="text-sm text-gray-500 group-hover:text-blue-600 font-medium">Create Board</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create Board</h2>
            <div
              className="w-full h-24 rounded-xl mb-4 flex items-center justify-center"
              style={{ backgroundColor: newBoard.backgroundColor }}
            >
              <p className="text-white font-semibold text-lg drop-shadow">
                {newBoard.name || 'Board Name'}
              </p>
            </div>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Board Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBoard.name}
                  onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                  placeholder="e.g. Sprint 1, Marketing Campaign"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Background Color</label>
                <div className="flex flex-wrap gap-2">
                  {boardColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewBoard({ ...newBoard, backgroundColor: color })}
                      className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                      style={{
                        backgroundColor: color,
                        outline: newBoard.backgroundColor === color ? `3px solid ${color}` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!newBoard.name.trim() || isCreating}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
                >
                  {isCreating ? 'Creating...' : 'Create Board'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setNewBoard({ name: '', description: '', backgroundColor: '#0079BF' }); }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
