import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

function NotificationBell() {
  const { notifications, unreadCount, loadNotifications, markAsRead, markAllAsRead } = useNotifications();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      // Poll every 30 seconds for new notifications
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loadNotifications]);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div 
        style={{ cursor: 'pointer', padding: '0.25rem' }} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontSize: '1.25rem' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: 'var(--danger)',
            color: 'white',
            fontSize: '0.625rem',
            fontWeight: 700,
            borderRadius: '9999px',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          width: '320px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' 
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No new notifications
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  style={{ 
                    padding: '0.75rem 1rem', 
                    borderBottom: '1px solid var(--border-color)',
                    background: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                    cursor: notif.read ? 'default' : 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: notif.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {notif.title}
                    </span>
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
