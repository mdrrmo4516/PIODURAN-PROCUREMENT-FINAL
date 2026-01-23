import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { Bell, CheckCheck, Trash2, Info, CheckCircle, XCircle, FileText } from 'lucide-react';
import * as DB from '../../services/indexedDbPurchases';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'purchase_created': return <FileText className="w-4 h-4 text-blue-500" />;
    case 'status_changed': return <Info className="w-4 h-4 text-purple-500" />;
    case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'denied': return <XCircle className="w-4 h-4 text-red-500" />;
    default: return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const notifs = await DB.listNotifications();
      setNotifications(notifs);
      const count = await DB.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    await DB.markNotificationRead(id);
    await loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await DB.markAllNotificationsRead();
    await loadNotifications();
  };

  const handleDelete = async (id) => {
    await DB.deleteNotification(id);
    await loadNotifications();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-primary/10"
        >
          <Bell className="w-5 h-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-popover border-border" align="end">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h4 className="font-semibold text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs text-primary hover:text-primary/80"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 hover:bg-muted/50 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!notif.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-primary hover:text-primary/80"
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          <CheckCheck className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-500"
                        onClick={() => handleDelete(notif.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
