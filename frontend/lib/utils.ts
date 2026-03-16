import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

// Merge tailwind classes
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

// Format date to relative time
export const timeAgo = (date: string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Format date to readable string
export const formatDate = (date: string): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

// Format date with time
export const formatDateTime = (date: string): string => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

// Get priority color
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// Get priority badge color (dot)
export const getPriorityDotColor = (priority: string): string => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

// Get label color
export const getLabelColor = (label: string): string => {
  const colors: Record<string, string> = {
    bug: 'bg-red-100 text-red-700',
    feature: 'bg-blue-100 text-blue-700',
    improvement: 'bg-purple-100 text-purple-700',
    design: 'bg-pink-100 text-pink-700',
    backend: 'bg-green-100 text-green-700',
    frontend: 'bg-yellow-100 text-yellow-700',
    urgent: 'bg-red-100 text-red-700',
    documentation: 'bg-gray-100 text-gray-700',
  };
  return colors[label.toLowerCase()] || 'bg-gray-100 text-gray-700';
};

// Get user initials for avatar
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Get random avatar background color
export const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Check if date is overdue
export const isOverdue = (date: string): boolean => {
  return new Date(date) < new Date();
};

// Truncate text
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
};

// Board background colors
export const boardColors = [
  '#0079BF',
  '#D29034',
  '#519839',
  '#B04632',
  '#89609E',
  '#CD5A91',
  '#4BBF6B',
  '#00AECC',
  '#838C91',
  '#1A1A2E',
];
