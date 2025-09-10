import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, makeAuthenticatedRequest } = useAuth();

  // Fetch notifications
  const fetchNotifications = async (limit = 10) => {
    if (!user) return;
    
    try {
      const response = await makeAuthenticatedRequest(
        `http://localhost:5000/api/notifications?limit=${limit}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const response = await makeAuthenticatedRequest(
        'http://localhost:5000/api/notifications/unread-count'
      );
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Mark notifications as read
  const markAsRead = async (notificationIds = []) => {
    if (!user) return;
    
    try {
      const response = await makeAuthenticatedRequest(
        'http://localhost:5000/api/notifications/mark-read',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notificationIds })
        }
      );
      
      if (response.ok) {
        // Update local state
        if (notificationIds.length === 0) {
          // Mark all as read
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          setUnreadCount(0);
        } else {
          // Mark specific notifications as read
          setNotifications(prev => 
            prev.map(n => 
              notificationIds.includes(n.id) ? { ...n, isRead: true } : n
            )
          );
          setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
        }
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  // Poll for new notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
