import { useNotifications } from '../../context/NotificationContext';

function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <div style={{ position: 'relative', cursor: 'pointer' }}>
      <span style={{ fontSize: '1.25rem' }}>🔔</span>
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '-6px',
          right: '-8px',
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
  );
}

export default NotificationBell;
