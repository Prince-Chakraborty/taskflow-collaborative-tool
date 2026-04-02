'use client';

import { useState, useEffect } from 'react';
import { Plus, Briefcase, Users, LayoutDashboard, Trash2 } from 'lucide-react';
import { workspaceAPI } from '@/lib/api';
import { Workspace } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Loading from '@/components/common/Loading';
import { WorkspaceSkeleton } from '@/components/common/Skeleton';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated) fetchWorkspaces();
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("createWorkspace=true")) {
      setShowCreateModal(true);
    }
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await workspaceAPI.getAll();
      setWorkspaces(response.data.data);
    } catch (err) {
      toast.error('Failed to fetch workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspace.name.trim()) return;
    setIsCreating(true);
    try {
      const response = await workspaceAPI.create(newWorkspace);
      setWorkspaces([...workspaces, response.data.data]);
      setNewWorkspace({ name: '', description: '' });
      setShowCreateModal(false);
      toast.success('Workspace created!');
    } catch (err) {
      toast.error('Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (!confirm('Delete this workspace and all its boards?')) return;
    try {
      await workspaceAPI.delete(workspaceId);
      setWorkspaces(workspaces.filter((w) => w.id !== workspaceId));
      toast.success('Workspace deleted');
    } catch (err) {
      toast.error('Failed to delete workspace');
    }
  };

  if (authLoading) return <Loading fullScreen text="Loading..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      {/* IMPORTANT: ml-64 pushes content past sidebar, pt-14 pushes past navbar */}
      <main style={{marginLeft: "256px", paddingTop: "56px"}}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <LayoutDashboard className="text-blue-600" size={24} />
                Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Welcome back, {user?.name}! 👋
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
            >
              <Plus size={16} />
              New Workspace
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{workspaces.length}</p>
                  <p className="text-sm text-gray-500">Workspaces</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <LayoutDashboard className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {workspaces.reduce((acc, w) => acc + (parseInt(String(w.board_count)) || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-500">Total Boards</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {workspaces.reduce((acc, w) => acc + (parseInt(String(w.member_count)) || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-500">Total Members</p>
                </div>
              </div>
            </div>
          </div>

          {/* Workspaces */}
          {isLoading ? (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Workspaces</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <WorkspaceSkeleton key={i} />)}
              </div>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="text-gray-400" size={36} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No workspaces yet</h3>
              <p className="text-gray-500 text-sm mb-4">Create your first workspace to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm"
              >
                Create Workspace
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Your Workspaces
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
                    onClick={() => router.push(`/workspace/${workspace.id}`)}
                  >
                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {workspace.name[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors text-sm">
                              {workspace.name}
                            </h3>
                            {workspace.description && (
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {workspace.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {workspace.member_role === 'admin' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteWorkspace(workspace.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <LayoutDashboard size={11} />
                            {parseInt(String(workspace.board_count)) || 0} {parseInt(String(workspace.board_count)) === 1 ? "board" : "boards"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={11} />
                            {parseInt(String(workspace.member_count)) || 0} {parseInt(String(workspace.member_count)) === 1 ? "member" : "members"}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          workspace.member_role === 'admin'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {workspace.member_role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create Workspace</h2>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Workspace Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                  placeholder="e.g. My Team, Project Alpha"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Description
                </label>
                <textarea
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                  placeholder="What is this workspace for?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none text-gray-900 bg-white"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!newWorkspace.name.trim() || isCreating}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
                >
                  {isCreating ? 'Creating...' : 'Create Workspace'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setNewWorkspace({ name: '', description: '' }); }}
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
