import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, makeAuthenticatedRequest } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Polling interval (30 seconds)
  const POLLING_INTERVAL = 30000;

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (page = 1, limit = 20, unreadOnly = false) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(unreadOnly && { unreadOnly: 'true' })
      });

      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/notifications?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, makeAuthenticatedRequest]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await makeAuthenticatedRequest('http://localhost:5000/api/notifications/unread-count');

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data = await response.json();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [user, makeAuthenticatedRequest]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!user) return false;

    try {
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, [user, makeAuthenticatedRequest]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return false;

    try {
      const response = await makeAuthenticatedRequest('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      // Reset unread count
      setUnreadCount(0);

      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, [user, makeAuthenticatedRequest]);

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    const data = await fetchNotifications(1, 20, false);
    if (data) {
      setNotifications(data.notifications);
    }

    // Also fetch unread count
    await fetchUnreadCount();
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Set up polling
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Load initial data
    loadNotifications();

    // Set up polling interval
    const interval = setInterval(() => {
      fetchUnreadCount();
      // Also fetch new notifications to keep the list updated
      fetchNotifications(1, 20, false).then(data => {
        if (data) {
          setNotifications(data.notifications);
        }
      });
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [user, loadNotifications, fetchUnreadCount, fetchNotifications]);

  // Refresh notifications (for manual refresh)
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Navigate to notification link
  const navigateToNotification = useCallback((notification) => {
    if (notification.link) {
      // Mark as read first
      markAsRead(notification.id);
      
      // Navigate to the link
      window.location.href = notification.link;
    }
  }, [markAsRead]);

  // Format notification time
  const formatNotificationTime = useCallback((timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    navigateToNotification,
    formatNotificationTime,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};