import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Paperclip, Upload, Trash2, Download, FileText, Image, File, AlertCircle } from 'lucide-react';
import * as DB from '../../services/indexedDbPurchases';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (mimeType) => {
  if (mimeType?.startsWith('image/')) return <Image className="w-8 h-8 text-purple-500" />;
  if (mimeType?.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
  return <File className="w-8 h-8 text-blue-500" />;
};

export const AttachmentsModal = ({ open, onClose, purchase, onUpdate }) => {
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open && purchase) {
      loadAttachments();
    }
  }, [open, purchase]);

  const loadAttachments = async () => {
    try {
      const atts = await DB.listAttachments(purchase.id);
      setAttachments(atts);
    } catch (err) {
      console.error('Failed to load attachments:', err);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      for (const file of files) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
          continue;
        }

        // Read file as base64
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        await DB.addAttachment(purchase.id, {
          filename: `${Date.now()}-${file.name}`,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          data,
          uploadedBy: 'User'
        });
      }

      await loadAttachments();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Failed to upload file(s)');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;

    try {
      await DB.deleteAttachment(attachmentId, 'User');
      await loadAttachments();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Failed to delete attachment');
      console.error(err);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const fullAttachment = await DB.getAttachment(attachment.id);
      if (!fullAttachment?.data) {
        setError('File data not found');
        return;
      }

      // Create download link
      const link = document.createElement('a');
      link.href = fullAttachment.data;
      link.download = attachment.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download file');
      console.error(err);
    }
  };

  if (!purchase) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-popover border-border">
        <DialogHeader className="gradient-btn-primary -m-6 mb-0 p-6 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            Attachments
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {purchase.prNo} - {purchase.title}
          </p>
        </DialogHeader>

        <div className="pt-6 space-y-4">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
            />
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-2">Drag & drop files here or</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gradient-btn-primary"
            >
              {uploading ? 'Uploading...' : 'Browse Files'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Max file size: 10MB</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Attachments List */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Attached Files ({attachments.length})</h4>
            
            {attachments.length === 0 ? (
              <div className="text-center py-8">
                <Paperclip className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">No attachments yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(att.mimeType)}
                        <div>
                          <p className="font-medium text-foreground text-sm truncate max-w-[300px]">
                            {att.originalName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(att.size)} • {new Date(att.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(att)}
                          className="text-blue-500 hover:text-blue-600 hover:bg-blue-100"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(att.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
