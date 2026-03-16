'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, ChevronDown, LogOut, User, Settings, Check, Trash2, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Avatar from '@/components/common/Avatar';
import useAuthStore from '@/store/authStore';
import useAuth from '@/hooks/useAuth';
import useNotificationStore from '@/store/notificationStore';
import { timeAgo } from '@/lib/utils';

const Navbar = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const router = useRouter();
  const { notifications, unreadCount, markAllRead, clearAll } = useNotificationStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const handleNotifClick = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen) markAllRead();
  };
  return (
    <nav className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
      {/* Left - Logo */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg hidden sm:block">TaskFlow</span>
        </Link>
      </div>
      {/* Center - Search */}
      <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 text-gray-200 placeholder-gray-500 pl-9 pr-4 py-1.5 rounded-lg text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </form>
      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center w-9 h-9"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={handleNotifClick}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative flex items-center justify-center w-9 h-9"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
                >
                  <Trash2 size={11} /> Clear all
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        !notif.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          notif.type === 'success' ? 'bg-green-500' :
                          notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-xs text-gray-700">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notif.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {user && <Avatar name={user.name} avatar={user.avatar} size="sm" />}
            <span className="text-gray-300 text-sm hidden sm:block">{user?.name}</span>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => { setIsDropdownOpen(false); router.push('/profile'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User size={15} /> Profile
              </button>
              <button
                onClick={() => { setIsDropdownOpen(false); router.push('/settings'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings size={15} /> Settings
              </button>
              <div className="border-t border-gray-100 mt-1">
                <button
                  onClick={() => { setIsDropdownOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
