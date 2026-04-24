function BookingStatusBadge({ status }) {
  let background = '#f8fafc';
  let color = '#0f172a';

  switch (status) {
    case 'APPROVED':
      background = '#dcfce7';
      color = '#166534';
      break;
    case 'PENDING':
      background = '#d2cc87';
      color = '#92400e';
      break;
    case 'REJECTED':
      background = '#fee2e2';
      color = '#991b1b';
      break;
    case 'CANCELLED':
      background = '#e2e8f0';
      color = '#1e293b';
      break;
    default:
      background = '#e2e8f0';
      color = '#1e293b';
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.65rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 700,
      background,
      color ,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {status}
    </span>
  );
}

export default BookingStatusBadge;
