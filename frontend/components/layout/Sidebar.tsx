'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Plus, ChevronDown, ChevronRight, Briefcase, Settings, Users, X, Menu } from 'lucide-react';
import { workspaceAPI } from '@/lib/api';
import { Workspace } from '@/types';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const fetchWorkspaces = async () => {
    try {
      const response = await workspaceAPI.getAll();
      setWorkspaces(response.data.data);
    } catch (err) {
      console.error('Failed to fetch workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspaces((prev) =>
      prev.includes(workspaceId)
        ? prev.filter((id) => id !== workspaceId)
        : [...prev, workspaceId]
    );
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  const SidebarContent = () => (
    <div className="p-3">
      {/* Main Nav */}
      <div className="mb-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            )}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </div>

      {/* Workspaces */}
      <div>
        <div className="flex items-center justify-between px-3 py-2 mb-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Workspaces
          </span>
          <Link
            href="/dashboard?createWorkspace=true"
            className="p-1 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <Plus size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="px-3 py-2">
            <div className="h-4 bg-gray-800 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="px-3 py-2 text-xs text-gray-600">
            No workspaces yet.{' '}
            <Link href="/dashboard?createWorkspace=true" className="text-blue-500 hover:underline">
              Create one
            </Link>
          </div>
        ) : (
          workspaces.map((workspace) => (
            <div key={workspace.id} className="mb-1">
              <button
                onClick={() => toggleWorkspace(workspace.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors group',
                  pathname.includes(workspace.id)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
              >
                <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {workspace.name[0].toUpperCase()}
                </div>
                <span className="flex-1 text-left truncate">{workspace.name}</span>
                {expandedWorkspaces.includes(workspace.id) ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>

              {expandedWorkspaces.includes(workspace.id) && (
                <div className="ml-3 mt-1 border-l border-gray-800 pl-3 space-y-1">
                  <Link
                    href={`/workspace/${workspace.id}`}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors',
                      pathname === `/workspace/${workspace.id}`
                        ? 'text-white bg-gray-800'
                        : 'text-gray-500 hover:text-white hover:bg-gray-800'
                    )}
                  >
                    <Briefcase size={12} /> Boards
                  </Link>
                  <Link
                    href={`/workspace/${workspace.id}?tab=members`}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Users size={12} /> Members
                  </Link>
                  <Link
                    href={`/workspace/${workspace.id}?tab=settings`}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Settings size={12} /> Settings
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-3.5 left-4 z-50 p-2 text-gray-400 hover:text-white lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto z-50 transition-transform duration-300 lg:hidden',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <span className="text-white font-bold">TaskFlow</span>
          <button onClick={() => setIsMobileOpen(false)} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 fixed left-0 top-14 bottom-0 overflow-y-auto z-30 hidden lg:block">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
