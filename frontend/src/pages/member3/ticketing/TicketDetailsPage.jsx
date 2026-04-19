import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import ticketService from '../../../services/member3/ticketService';
import { useAuth } from '../../../context/AuthContext';

function toActorId(email) {
  const local = (email || '').split('@')[0] || 'usr';
  const normalized = local.replace(/[^a-zA-Z0-9_-]/g, '_');
  if (normalized.length >= 3) return normalized.slice(0, 60);
  return `${normalized}usr`.slice(0, 60);
}

function formatDate(isoDate) {
  if (!isoDate) return '-';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString();
}

function statusBadgeClass(status) {
  const value = (status || '').toUpperCase();
  if (value === 'OPEN') return 'badge-open';
  if (value === 'IN_PROGRESS') return 'badge-in-progress';
  if (value === 'RESOLVED') return 'badge-resolved';
  if (value === 'CLOSED') return 'badge-closed';
  if (value === 'REJECTED') return 'badge-rejected';
  return 'badge-info';
}

function priorityBadgeClass(priority) {
  const value = (priority || '').toUpperCase();
  if (value === 'LOW') return 'badge-info';
  if (value === 'MEDIUM') return 'badge-warning';
  if (value === 'HIGH' || value === 'CRITICAL') return 'badge-danger';
  return 'badge-info';
}

function TicketDetailsPage() {
  const { ticketId } = useParams();
  const { user, isTechnician, isAdmin } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const [assignTo, setAssignTo] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const [commentContent, setCommentContent] = useState('');
  const [commentVisibility, setCommentVisibility] = useState('PUBLIC');
  const [commentPinned, setCommentPinned] = useState(false);

  const actorId = useMemo(() => toActorId(user?.email), [user?.email]);
  const canModerate = isTechnician || isAdmin;

  const loadDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        ticketService.getTicketById(ticketId),
        ticketService.getComments(ticketId),
      ]);

      setTicket(ticketRes.data);
      setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
      setAssignTo(ticketRes.data?.assignedTo || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const runAction = async (fn) => {
    setActionLoading(true);
    setActionError('');
    try {
      await fn();
      await loadDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (event) => {
    event.preventDefault();
    await runAction(() => ticketService.assignTechnician(ticketId, { technicianId: assignTo.trim() }));
  };

  const handleResolve = async (event) => {
    event.preventDefault();
    await runAction(() => ticketService.resolveTicket(ticketId, {
      resolutionNotes: resolutionNotes.trim(),
      resolvedBy: actorId,
    }));
    setResolutionNotes('');
  };

  const handleClose = async () => {
    await runAction(() => ticketService.closeTicket(ticketId, { closedBy: actorId }));
  };

  const handleReject = async (event) => {
    event.preventDefault();
    await runAction(() => ticketService.rejectTicket(ticketId, {
      reason: rejectReason.trim(),
      rejectedBy: actorId,
    }));
    setRejectReason('');
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    await runAction(() => ticketService.addComment(ticketId, {
      content: commentContent.trim(),
      visibility: canModerate ? commentVisibility : 'PUBLIC',
      pinned: canModerate ? commentPinned : false,
    }));
    setCommentContent('');
    setCommentPinned(false);
  };

  const handleDeleteComment = async (commentId) => {
    await runAction(() => ticketService.deleteComment(ticketId, commentId));
  };

  const showAssign = canModerate && ticket && !['CLOSED', 'REJECTED'].includes(ticket.status);
  const showResolve = canModerate && ticket?.status === 'IN_PROGRESS';
  const showClose = canModerate && ticket?.status === 'RESOLVED';
  const showReject = isAdmin && ticket && ['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(ticket.status);

  return (
    <div className="fade-in" style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ marginBottom: '0.35rem' }}>Ticket Details</h2>
          <p style={{ color: 'var(--text-secondary)' }}>ID: {ticketId}</p>
        </div>
        <Link className="btn btn-secondary" to="/tickets/list">Back to List</Link>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid rgba(239,68,68,0.25)',
          background: 'rgba(239,68,68,0.1)',
          color: '#fca5a5',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="card" style={{ color: 'var(--text-muted)' }}>Loading ticket details...</div>
      )}

      {!loading && ticket && (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h3>{ticket.title}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className={`badge ${statusBadgeClass(ticket.status)}`}>{ticket.status}</span>
                <span className={`badge ${priorityBadgeClass(ticket.priority)}`}>{ticket.priority}</span>
              </div>
            </div>

            <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>{ticket.description}</p>

            <div style={{
              marginTop: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.65rem',
            }}>
              <div><strong>Category:</strong> {ticket.category || '-'}</div>
              <div><strong>Reported By:</strong> {ticket.reportedBy || '-'}</div>
              <div><strong>Assigned To:</strong> {ticket.assignedTo || 'Unassigned'}</div>
              <div><strong>Created:</strong> {formatDate(ticket.createdAt)}</div>
              <div><strong>Resolved By:</strong> {ticket.resolvedBy || '-'}</div>
              <div><strong>Closed By:</strong> {ticket.closedBy || '-'}</div>
            </div>

            {ticket.resolutionNotes && (
              <div style={{ marginTop: '0.85rem', padding: '0.65rem', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                <strong>Resolution Notes:</strong>
                <p style={{ marginTop: '0.35rem', color: 'var(--text-secondary)' }}>{ticket.resolutionNotes}</p>
              </div>
            )}

            {ticket.rejectionReason && (
              <div style={{ marginTop: '0.85rem', padding: '0.65rem', borderRadius: '8px', background: 'rgba(239,68,68,0.12)' }}>
                <strong>Rejection Reason:</strong>
                <p style={{ marginTop: '0.35rem', color: '#fca5a5' }}>{ticket.rejectionReason}</p>
              </div>
            )}
          </div>

          {(showAssign || showResolve || showClose || showReject) && (
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>Technician Actions</h3>

              {actionError && (
                <div style={{
                  marginBottom: '0.8rem',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(239,68,68,0.25)',
                  background: 'rgba(239,68,68,0.1)',
                  color: '#fca5a5',
                  fontSize: '0.875rem',
                }}>
                  {actionError}
                </div>
              )}

              {showAssign && (
                <form onSubmit={handleAssign} style={{ marginBottom: '0.8rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem' }}>Assign Technician</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      className="form-control"
                      style={{ minWidth: '220px', flex: 1 }}
                      value={assignTo}
                      onChange={(e) => setAssignTo(e.target.value)}
                      placeholder="tech_001"
                      required
                    />
                    <button className="btn btn-primary" type="submit" disabled={actionLoading}>Assign</button>
                  </div>
                </form>
              )}

              {showResolve && (
                <form onSubmit={handleResolve} style={{ marginBottom: '0.8rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem' }}>Resolve Ticket</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Add required resolution notes"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    required
                  />
                  <button className="btn btn-success" type="submit" disabled={actionLoading} style={{ marginTop: '0.5rem' }}>
                    Mark Resolved
                  </button>
                </form>
              )}

              {showClose && (
                <div style={{ marginBottom: '0.8rem' }}>
                  <button className="btn btn-secondary" type="button" onClick={handleClose} disabled={actionLoading}>
                    Close Ticket
                  </button>
                </div>
              )}

              {showReject && (
                <form onSubmit={handleReject}>
                  <label style={{ display: 'block', marginBottom: '0.4rem' }}>Reject Ticket (Admin)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Provide mandatory rejection reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                  />
                  <button className="btn btn-danger" type="submit" disabled={actionLoading} style={{ marginTop: '0.5rem' }}>
                    Reject Ticket
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="card">
            <h3 style={{ marginBottom: '0.75rem' }}>Comments</h3>

            <form onSubmit={handleAddComment} style={{ marginBottom: '1rem' }}>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                required
              />

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {canModerate && (
                  <>
                    <select className="form-control" value={commentVisibility} onChange={(e) => setCommentVisibility(e.target.value)} style={{ width: '170px' }}>
                      <option value="PUBLIC">PUBLIC</option>
                      <option value="INTERNAL">INTERNAL</option>
                    </select>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={commentPinned} onChange={(e) => setCommentPinned(e.target.checked)} />
                      Pin comment
                    </label>
                  </>
                )}

                <button className="btn btn-primary" type="submit" disabled={actionLoading}>Add Comment</button>
              </div>
            </form>

            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {comments.length === 0 && (
                <p style={{ color: 'var(--text-muted)' }}>No comments yet.</p>
              )}

              {comments.map((comment) => (
                <div key={comment.id} style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.7rem',
                  background: 'var(--bg-secondary)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{comment.authorId}</span>
                      <span className={`badge ${comment.visibility === 'INTERNAL' ? 'badge-info' : 'badge-open'}`}>{comment.visibility}</span>
                      {comment.pinned && <span className="badge badge-warning">PINNED</span>}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(comment.createdAt)}</span>
                  </div>

                  <p style={{ marginTop: '0.45rem', color: 'var(--text-primary)' }}>{comment.content}</p>

                  {canModerate && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <button
                        className="btn btn-danger"
                        type="button"
                        style={{ padding: '0.32rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TicketDetailsPage;
