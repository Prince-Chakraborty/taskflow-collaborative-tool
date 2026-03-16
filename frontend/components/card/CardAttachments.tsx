'use client';

import { useState, useRef } from 'react';
import { Paperclip, Upload, Trash2, Download, File } from 'lucide-react';
import { Attachment } from '@/types';
import { uploadAPI } from '@/lib/api';
import { formatFileSize, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CardAttachmentsProps {
  cardId: string;
  attachments: Attachment[];
  onUpdate: (attachments: Attachment[]) => void;
}

const CardAttachments = ({ cardId, attachments, onUpdate }: CardAttachmentsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await uploadAPI.uploadCardAttachment(cardId, formData);
      onUpdate([...attachments, response.data.data]);
      toast.success('File uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Delete this attachment?')) return;
    try {
      await uploadAPI.deleteAttachment(attachmentId);
      onUpdate(attachments.filter((a) => a.id !== attachmentId));
      toast.success('Attachment deleted');
    } catch (err) {
      toast.error('Failed to delete attachment');
    }
  };

  const isImage = (fileType: string) => fileType.startsWith('image/');

  const handleDownload = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-gray-600" />
          <h4 className="font-semibold text-gray-800 text-sm">
            Attachments ({attachments.length})
          </h4>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
        >
          <Upload size={12} />
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>

      {attachments.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Click to upload files</p>
          <p className="text-xs text-gray-400 mt-1">Max 5MB per file</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors"
            >
              {isImage(attachment.file_type) ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                  <img
                    src={attachment.file_url}
                    alt={attachment.file_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <File className="w-5 h-5 text-blue-600" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {attachment.file_name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.file_size)} • {timeAgo(attachment.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDownload(attachment.file_url)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => handleDelete(attachment.id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardAttachments;
