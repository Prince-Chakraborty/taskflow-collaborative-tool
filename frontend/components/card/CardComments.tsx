'use client';

import { useState } from 'react';
import { Trash2, Send } from 'lucide-react';
import { Comment } from '@/types';
import { cardAPI } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import Avatar from '@/components/common/Avatar';
import useAuthStore from '@/store/authStore';
import { emitCommentAdded } from '@/lib/socket';
import toast from 'react-hot-toast';

interface CardCommentsProps {
  cardId: string;
  boardId: string;
  comments: Comment[];
  onUpdate: (comments: Comment[]) => void;
}

const CardComments = ({ cardId, boardId, comments, onUpdate }: CardCommentsProps) => {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const response = await cardAPI.addComment(cardId, { content: content.trim() });
      const newComment = response.data.data;
      onUpdate([...comments, newComment]);

      emitCommentAdded({ boardId, cardId, comment: newComment });

      setContent('');
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await cardAPI.deleteComment(cardId, commentId);
      onUpdate(comments.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e as any);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h4 className="font-semibold text-gray-800 text-sm">
          Comments ({comments.length})
        </h4>
      </div>

      {/* Add Comment */}
      {user && (
        <div className="flex gap-2 mb-4">
          <Avatar name={user.name} avatar={user.avatar} size="sm" />
          <form onSubmit={handleSubmit} className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment... Use @name to mention someone (Ctrl+Enter to submit)"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none text-gray-800 placeholder-gray-400"
              rows={2}
            />
            <div className="flex justify-end mt-1.5">
              <button
                type="submit"
                disabled={!content.trim() || isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
              >
                <Send size={12} />
                {isLoading ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 group">
              <Avatar name={comment.user_name} avatar={comment.user_avatar} size="sm" />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-800">
                      {comment.user_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {timeAgo(comment.created_at)}
                      </span>
                      {user?.id === comment.user_id && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.content.split(/(@\w+)/g).map((part, i) =>
                      part.startsWith('@') ? (
                        <span key={i} className="text-blue-600 font-semibold bg-blue-50 px-1 rounded">
                          {part}
                        </span>
                      ) : part
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CardComments;
