import { useNotifications } from '../../context/NotificationContext';

function NotificationPanel() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const getTypeIcon = (type) => {
    const icons = { INFO: 'ℹ️', SUCCESS: '✅', WARNING: '⚠️', ERROR: '❌' };
    return icons[type] || 'ℹ️';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card" style={{ maxWidth: '400px', maxHeight: '500px', overflow: 'auto' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1rem', paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Notifications</h3>
        <button onClick={markAllAsRead}
          style={{
            background: 'none', border: 'none', color: 'var(--primary-light)',
            cursor: 'pointer', fontSize: '0.75rem',
          }}>
          Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.875rem' }}>
          No notifications
        </p>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => markAsRead(notification.id)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              background: notification.read ? 'transparent' : 'rgba(237, 123, 63, 0.05)',
              borderLeft: notification.read ? 'none' : '3px solid #ed7b3f',
              transition: 'var(--transition)',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span>{getTypeIcon(notification.type)}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: notification.read ? 400 : 600, fontSize: '0.875rem' }}>
                  {notification.title}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                  {notification.message}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', marginTop: '0.375rem' }}>
                  {formatDate(notification.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default NotificationPanel;
