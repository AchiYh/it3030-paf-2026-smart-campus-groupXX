function DeleteModal({ isOpen, resourceName, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: '24px',
          margin: '16px',
        }}
      >
        <div style={{ textAlign: 'center', fontSize: '42px', marginBottom: '8px' }}>⚠️</div>
        <h2 style={{ color: '#ffffff', textAlign: 'center', fontWeight: 700, marginBottom: '10px' }}>
          Delete Resource
        </h2>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '18px' }}>
          Are you sure you want to delete {resourceName}? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;// DeleteModal component - Member 1
