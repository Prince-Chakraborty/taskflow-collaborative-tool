'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Activity, Search, Filter } from 'lucide-react';
import { boardAPI, cardAPI } from '@/lib/api';
import { ActivityLog } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Board from '@/components/board/Board';
import Loading from '@/components/common/Loading';
import Avatar from '@/components/common/Avatar';
import OnlineUsers from '@/components/board/OnlineUsers';
import useAuth from '@/hooks/useAuth';
import useNotificationStore from '@/store/notificationStore';
import useBoardStore from '@/store/boardStore';
import useSocket from '@/hooks/useSocket';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BoardPage() {
  const { boardId } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { board, setBoard, isLoading } = useBoardStore();
  const { addNotification } = useNotificationStore();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [showActivity, setShowActivity] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimerRef = useRef<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { lists } = useBoardStore();
  const overdueCount = lists.reduce((acc, list) => {
    return acc + (list.cards?.filter(c => {
      if (!c.due_date) return false;
      return new Date(c.due_date) < new Date() && list.name !== 'Done';
    }).length || 0);
  }, 0);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [dueDateFilter, setDueDateFilter] = useState<string>('all');

  useSocket(boardId as string);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N') {
        if (document.activeElement?.tagName !== 'INPUT' && 
            document.activeElement?.tagName !== 'TEXTAREA') {
          // Focus first "Add a card" button
          const addCardBtn = document.querySelector('[data-add-card]') as HTMLButtonElement;
          if (addCardBtn) addCardBtn.click();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated && boardId) fetchBoard();
  }, [isAuthenticated, boardId]);

  // Send overdue notifications when board loads
  useEffect(() => {
    if (overdueCount > 0) {
      addNotification({
        message: `⚠️ ${overdueCount} overdue ${overdueCount === 1 ? 'card' : 'cards'} need attention`,
        type: 'warning',
      });
    }
  }, [overdueCount]);

  const fetchBoard = async () => {
    try {
      const response = await boardAPI.getOne(boardId as string);
      setBoard(response.data.data);
    } catch (err) {
      toast.error('Failed to load board');
      router.back();
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await boardAPI.getActivity(boardId as string);
      setActivityLogs(response.data.data);
    } catch (err) {
      toast.error('Failed to load activity');
    }
  };

  const handleToggleActivity = () => {
    setShowActivity(!showActivity);
    if (!showActivity) fetchActivity();
  };

  const doSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    try {
      const response = await cardAPI.search({ q: searchQuery, boardId: boardId as string });
      setSearchResults(response.data.data);
    } catch (err) {
      toast.error('Search failed');
    }
  };
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    doSearch();
  };

  const getActivityMessage = (log: ActivityLog) => {
    const details = log.details as any;
    switch (log.action) {
      case 'created_board': return `created board "${details.boardName}"`;
      case 'created_list': return `created list "${details.listName}"`;
      case 'created_card': return `created card "${details.cardTitle}"`;
      case 'moved_card': return `moved "${details.cardTitle}" from "${details.fromList}" to "${details.toList}"`;
      case 'updated_card': return `updated card "${details.cardTitle}"`;
      case 'added_comment': return `commented on a card`;
      default: return log.action.replace(/_/g, ' ');
    }
  };

  if (authLoading || isLoading) return <Loading fullScreen text="Loading board..." />;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <Sidebar />

      {/* Main content - pushed right by sidebar, pushed down by navbar */}
      <div style={{ marginLeft: "256px", paddingTop: "56px" }} className="flex flex-col h-screen">

        {/* Board Sub-Header */}
        <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 flex-shrink-0 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: board?.background_color || '#0079BF' }}
            />
            <h1 className="text-white font-semibold text-base">{board?.name}</h1>
          </div>

          {/* Assignee Filter */}
          <div className="hidden sm:flex items-center gap-1.5">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Members</option>
              <option value="unassigned">Unassigned</option>
              <option value="me">Assigned to Me</option>
            </select>
          </div>

          {/* Due Date Filter */}
          <div className="hidden sm:flex items-center gap-1.5">
            <select
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="bg-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="hidden sm:flex items-center gap-1.5">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            {board && (
              <OnlineUsers
                boardId={boardId as string}
                workspaceId={board.workspace_id}
              />
            )}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (!val.trim()) { setSearchResults([]); return; }
                    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
                    searchTimerRef.current = setTimeout(() => {
                      cardAPI.search({ q: val, boardId: boardId as string })
                        .then(r => setSearchResults(r.data.data))
                        .catch(() => toast.error('Search failed'));
                    }, 400);
                  }}
                  className="bg-gray-800 text-gray-200 placeholder-gray-500 pl-8 pr-3 py-1.5 rounded-lg text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                />
              </div>
            </form>
            <button
              onClick={handleToggleActivity}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showActivity ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Activity size={15} />
              Activity
            </button>
          </div>
        </div>

        {/* Overdue Banner */}
        {overdueCount > 0 && (
          <div className="mx-4 mt-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 flex-shrink-0">
            <span className="text-red-500">⚠️</span>
            <p className="text-sm text-red-700 font-medium">
              {overdueCount} overdue {overdueCount === 1 ? 'card' : 'cards'} — please review and update deadlines
            </p>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mx-4 mt-1 bg-white rounded-xl shadow-2xl p-3 z-50 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Results ({searchResults.length})</h4>
              <button onClick={() => setSearchResults([])} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {searchResults.map((card) => (
                <div key={card.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{card.title}</span>
                  <span className="text-xs text-gray-400 ml-auto">{card.list_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Board Canvas + Activity */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-x-auto overflow-y-auto bg-slate-100 p-4 min-h-0">
            {board && <Board boardId={boardId as string} priorityFilter={priorityFilter} assigneeFilter={assigneeFilter} dueDateFilter={dueDateFilter} />}
          </div>

          {showActivity && (
            <div className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-hidden flex-shrink-0">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                  <Activity size={15} className="text-blue-600" />
                  Activity Log
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {activityLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No activity yet</p>
                  </div>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="flex gap-2 p-2 hover:bg-gray-50 rounded-xl">
                      <Avatar name={log.user_name || 'User'} avatar={log.user_avatar} size="xs" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700">
                          <span className="font-semibold">{log.user_name}</span>{' '}
                          {getActivityMessage(log)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(log.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
