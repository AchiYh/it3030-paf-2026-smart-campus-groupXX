import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import ticketService from '../../../services/member3/ticketService';
import api from '../../../api';
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
  if (value === 'OVERDUE') return 'badge-overdue';
  if (value === 'RESOLVED') return 'badge-resolved';
  if (value === 'CLOSED') return 'badge-closed';
  if (value === 'REJECTED') return 'badge-rejected';
  return 'badge-info';
}

function priorityBadgeClass(priority) {
  const value = (priority || '').toUpperCase();
  if (value === 'CRITICAL') return 'badge-priority-critical';
  if (value === 'HIGH') return 'badge-priority-high';
  if (value === 'MEDIUM') return 'badge-priority-medium';
  if (value === 'LOW') return 'badge-priority-low';
  return 'badge-info';
}

function formatAssignee(ticket) {
  const snapshot = ticket?.assignedTechnician;
  if (snapshot?.fullName) {
    return `${snapshot.fullName}${snapshot.id ? ` (${snapshot.id})` : ''}`;
  }
  return ticket?.assignedTo || 'Unassigned';
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function categoryKeywords(category) {
  const normalized = normalizeText(category);
  if (!normalized) return [];

  const aliasMap = {
    electrical: ['electrical', 'electric', 'power', 'wiring', 'voltage'],
    plumbing: ['plumbing', 'pipe', 'water', 'leak', 'drain'],
    networking: ['networking', 'network', 'internet', 'wifi', 'lan'],
    hardware: ['hardware', 'computer', 'device', 'printer', 'equipment'],
    software: ['software', 'application', 'system', 'login', 'bug'],
    facilities: ['facilities', 'building', 'classroom', 'door', 'ac', 'air conditioning'],
  };

  const words = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  const keywordSet = new Set(words);

  Object.entries(aliasMap).forEach(([key, aliases]) => {
    if (normalized.includes(key) || aliases.some((alias) => normalized.includes(alias))) {
      aliases.forEach((alias) => keywordSet.add(alias));
      keywordSet.add(key);
    }
  });

  return Array.from(keywordSet);
}

function getTechnicianScore(technician, category) {
  const specialization = normalizeText(technician?.specialization || '');
  const categoryText = normalizeText(category || '');
  if (!specialization || !categoryText) return 0;

  if (specialization === categoryText) return 100;
  if (categoryText.includes(specialization) || specialization.includes(categoryText)) return 85;

  const keywords = categoryKeywords(categoryText);
  if (!keywords.length) return 0;

  let score = 0;
  keywords.forEach((keyword) => {
    if (specialization.includes(keyword) || keyword.includes(specialization)) {
      score += 20;
    }
  });

  return Math.min(score, 80);
}

function TicketDetailsPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user, isTechnician, isAdmin } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');

  const [assignTo, setAssignTo] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [busyTechnicianIds, setBusyTechnicianIds] = useState(new Set());
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  const [commentContent, setCommentContent] = useState('');
  const [commentVisibility, setCommentVisibility] = useState('PUBLIC');
  const [commentPinned, setCommentPinned] = useState(false);
  const [editingComment, setEditingComment] = useState({
    id: null,
    content: '',
    visibility: 'PUBLIC',
    pinned: false,
  });

  const [ticketEditMode, setTicketEditMode] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
  });

  const actorId = useMemo(() => toActorId(user?.email), [user?.email]);
  const canModerate = isTechnician || isAdmin;
  const userId = user?.id || '';
  const userEmail = (user?.email || '').toLowerCase();

  const identityMatches = (value) => {
    const normalized = String(value || '').toLowerCase();
    if (!normalized) return false;

    const emailPrefix = userEmail.includes('@') ? userEmail.split('@')[0] : '';
    return [String(userId || '').toLowerCase(), String(actorId || '').toLowerCase(), userEmail, emailPrefix]
      .filter(Boolean)
      .includes(normalized);
  };

  const isCommentOwner = (comment) => identityMatches(comment?.authorId);
  const isTicketOwner = (currentTicket) => identityMatches(currentTicket?.reportedBy);

  const loadTechnicianOptions = async () => {
    if (!canModerate) return;

    setLoadingTechnicians(true);
    try {
      const [techniciansRes, ticketsRes] = await Promise.all([
        api.get('/user/technicians').catch(() => ({ data: [] })),
        ticketService.getTickets(),
      ]);

      const fromTechnicianEndpoint = Array.isArray(techniciansRes.data)
        ? techniciansRes.data
        : Array.isArray(techniciansRes.data?.data)
          ? techniciansRes.data.data
          : [];

      let fromAdminAll = [];
      if (isAdmin && fromTechnicianEndpoint.length === 0) {
        const allUsersRes = await api.get('/user/admin/all').catch(() => ({ data: [] }));
        const allUsers = Array.isArray(allUsersRes.data) ? allUsersRes.data : [];
        fromAdminAll = allUsers.filter((u) => {
          const role = String(u?.role || '').replace('ROLE_', '').toUpperCase();
          return role.includes('TECHNICIAN');
        });
      }

      const mergedById = new Map();
      [...fromTechnicianEndpoint, ...fromAdminAll].forEach((tech) => {
        const id = tech?.id || tech?._id || tech?.userId || '';
        if (!id) return;
        if (!mergedById.has(id)) {
          mergedById.set(id, tech);
        }
      });

      const rawTechnicianList = Array.from(mergedById.values());

      const technicianList = rawTechnicianList
        .map((tech) => ({
          ...tech,
          id: tech?.id || tech?._id || tech?.userId || '',
          fullName: tech?.fullName || [tech?.firstName, tech?.lastName].filter(Boolean).join(' ').trim() || tech?.email || 'Unknown Technician',
          specialization: tech?.specialization || 'General',
        }))
        .filter((tech) => Boolean(tech.id));

      const allTickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
      const busy = new Set(
        allTickets
          .filter((item) => item?.id !== ticketId)
          .filter((item) => item?.assignedTo)
          .filter((item) => !['CLOSED', 'REJECTED'].includes(String(item?.status || '').toUpperCase()))
          .map((item) => item.assignedTo)
      );

      setTechnicians(technicianList);
      setBusyTechnicianIds(busy);

      if (technicianList.length === 0) {
        setActionError('No technicians found in the database. Please use the "Add Technician" page to register one.');
      }
    } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to load technicians.';
        setActionError(`Error loading technicians: ${msg}`);
        console.error("Technician fetch error:", err);
    } finally {
      setLoadingTechnicians(false);
    }
  };

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

      if (canModerate) {
        await loadTechnicianOptions();
      }
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

  useEffect(() => {
    if (!canModerate) return undefined;

    const handleWindowFocus = () => {
      loadTechnicianOptions().catch(() => {
        // Keep existing list if refresh fails.
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleWindowFocus();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canModerate, ticketId]);

  const runAction = async (fn) => {
    setActionLoading(true);
    setActionError('');
    setMessage('');
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
    if (!assignTo) {
      setActionError('Please select a technician.');
      return;
    }
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

    if (!commentContent.trim()) {
      setActionError('Comment text is required.');
      return;
    }

    await runAction(() => ticketService.addComment(ticketId, {
      content: commentContent.trim(),
      visibility: canModerate ? commentVisibility : 'PUBLIC',
      pinned: canModerate ? commentPinned : false,
    }));
    setCommentContent('');
    setCommentPinned(false);
    setMessage('Comment added successfully.');
  };

  const handleStartEditComment = (comment) => {
    setEditingComment({
      id: comment.id,
      content: comment.content || '',
      visibility: comment.visibility || 'PUBLIC',
      pinned: Boolean(comment.pinned),
    });
  };

  const handleCancelEditComment = () => {
    setEditingComment({ id: null, content: '', visibility: 'PUBLIC', pinned: false });
  };

  const handleSaveEditComment = async (comment) => {
    if (!editingComment.content.trim()) {
      setActionError('Comment text is required.');
      return;
    }

    await runAction(() => ticketService.updateComment(ticketId, comment.id, {
      content: editingComment.content.trim(),
      visibility: canModerate ? editingComment.visibility : comment.visibility,
      pinned: canModerate ? Boolean(editingComment.pinned) : Boolean(comment.pinned),
    }));
    handleCancelEditComment();
    setMessage('Comment updated successfully.');
  };

  const handleDeleteComment = async (commentId) => {
    await runAction(() => ticketService.deleteComment(ticketId, commentId));
    setMessage('Comment deleted successfully.');
  };

  const canEditTicket = ticket && isTicketOwner(ticket) && ticket.status === 'OPEN';
  const canDeleteTicket = ticket
    && isTicketOwner(ticket)
    && (ticket.status === 'OPEN' || ticket.status === 'REJECTED');

  const handleStartTicketEdit = () => {
    if (!ticket || !canEditTicket) return;
    setTicketForm({
      title: ticket.title || '',
      description: ticket.description || '',
      category: ticket.category || '',
      priority: ticket.priority || 'MEDIUM',
    });
    setTicketEditMode(true);
  };

  const handleCancelTicketEdit = () => {
    setTicketEditMode(false);
  };

  const handleSaveTicketEdit = async () => {
    if (!ticket || !canEditTicket) return;

    if (!ticketForm.title.trim() || !ticketForm.description.trim() || !ticketForm.category.trim()) {
      setActionError('Title, description and category are required.');
      return;
    }

    await runAction(() => ticketService.updateTicket(ticketId, {
      title: ticketForm.title.trim(),
      description: ticketForm.description.trim(),
      category: ticketForm.category.trim(),
      priority: ticketForm.priority,
      reportedBy: ticket.reportedBy,
      assignedTo: ticket.assignedTo || '',
      status: ticket.status,
    }));

    setTicketEditMode(false);
    setMessage('Ticket updated successfully.');
  };

  const handleDeleteTicket = async () => {
    if (!ticket || !canDeleteTicket) return;
    if (!window.confirm('Delete this ticket? This action cannot be undone.')) return;

    await runAction(() => ticketService.deleteTicket(ticketId));
    navigate('/tickets/list');
  };

  const showAssign = canModerate && ticket && !['CLOSED', 'REJECTED'].includes(ticket.status);
  const showResolve = isTechnician && ['IN_PROGRESS', 'OVERDUE'].includes(ticket?.status);
  const showClose = canModerate && ticket?.status === 'RESOLVED';
  const showReject = isAdmin && ticket && ['OPEN', 'IN_PROGRESS', 'OVERDUE', 'RESOLVED'].includes(ticket.status);

  const rankedTechnicians = useMemo(() => {
    const targetCategory = ticket?.category || '';

    return technicians
      .map((tech) => {
        const isCurrentAssignee = tech.id === ticket?.assignedTo;
        const isBusy = busyTechnicianIds.has(tech.id) && !isCurrentAssignee;
        const score = getTechnicianScore(tech, targetCategory);
        return { ...tech, isBusy, score };
      })
      .sort((a, b) => {
        if (a.isBusy !== b.isBusy) return a.isBusy ? 1 : -1;
        if (a.score !== b.score) return b.score - a.score;
        return String(a.fullName || '').localeCompare(String(b.fullName || ''));
      });
  }, [technicians, busyTechnicianIds, ticket?.assignedTo, ticket?.category]);

  const suggestedTechnicians = useMemo(
    () => rankedTechnicians.filter((tech) => !tech.isBusy && tech.score >= 20),
    [rankedTechnicians]
  );

  const otherTechnicians = useMemo(() => {
    const suggestedIds = new Set(suggestedTechnicians.map((tech) => tech.id));
    return rankedTechnicians.filter((tech) => !suggestedIds.has(tech.id));
  }, [rankedTechnicians, suggestedTechnicians]);

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

      {message && (
        <div style={{
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid rgba(16,185,129,0.25)',
          background: 'rgba(16,185,129,0.1)',
          color: '#6ee7b7',
          fontSize: '0.875rem',
        }}>
          {message}
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
              <div><strong>Assigned To:</strong> {formatAssignee(ticket)}</div>
              <div><strong>Due Date:</strong> {formatDate(ticket.dueAt)}</div>
              <div><strong>Created:</strong> {formatDate(ticket.createdAt)}</div>
              <div><strong>Resolved By:</strong> {ticket.resolvedBy || '-'}</div>
              <div><strong>Closed By:</strong> {ticket.closedBy || '-'}</div>
            </div>

            {ticket.status === 'OVERDUE' && (
              <div style={{ marginTop: '0.8rem', padding: '0.65rem', borderRadius: '8px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.35)' }}>
                <strong style={{ color: '#fca5a5' }}>Overdue Ticket</strong>
                <p style={{ marginTop: '0.35rem', color: '#fca5a5' }}>
                  This ticket passed its deadline and needs immediate attention.
                </p>
              </div>
            )}

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

            {(canEditTicket || canDeleteTicket) && (
              <div style={{ marginTop: '0.9rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {canEditTicket && (
                  <button className="btn btn-secondary" type="button" onClick={handleStartTicketEdit} disabled={actionLoading}>
                    Edit Ticket
                  </button>
                )}
                {canDeleteTicket && (
                  <button className="btn btn-danger" type="button" onClick={handleDeleteTicket} disabled={actionLoading}>
                    Delete Ticket
                  </button>
                )}
              </div>
            )}

            {ticketEditMode && canEditTicket && (
              <div style={{ marginTop: '0.9rem', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.8rem' }}>
                <h4 style={{ marginBottom: '0.65rem' }}>Edit Ticket</h4>
                <div className="form-group">
                  <label>Title</label>
                  <input className="form-control" value={ticketForm.title} onChange={(e) => setTicketForm((prev) => ({ ...prev, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows={4} value={ticketForm.description} onChange={(e) => setTicketForm((prev) => ({ ...prev, description: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                  <div className="form-group">
                    <label>Category</label>
                    <input className="form-control" value={ticketForm.category} onChange={(e) => setTicketForm((prev) => ({ ...prev, category: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select className="form-control" value={ticketForm.priority} onChange={(e) => setTicketForm((prev) => ({ ...prev, priority: e.target.value }))}>
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem' }}>
                  <button className="btn btn-primary" type="button" onClick={handleSaveTicketEdit} disabled={actionLoading}>Save</button>
                  <button className="btn btn-secondary" type="button" onClick={handleCancelTicketEdit} disabled={actionLoading}>Cancel</button>
                </div>
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
                    <select
                      className="form-control"
                      style={{ minWidth: '220px', flex: 1, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
                      value={assignTo}
                      onChange={(e) => setAssignTo(e.target.value)}
                      onFocus={() => {
                        loadTechnicianOptions().catch(() => {});
                      }}
                      disabled={actionLoading}
                      required
                    >
                      <option value="">Select technician</option>
                      {suggestedTechnicians.length > 0 && (
                        <optgroup label="Recommended for this ticket">
                          {suggestedTechnicians.map((tech) => {
                            const category = tech.specialization || 'General';
                            return (
                              <option key={tech.id} value={tech.id}>
                                {tech.fullName} - {category} (Recommended)
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                      {otherTechnicians.length > 0 && (
                        <optgroup label={suggestedTechnicians.length > 0 ? 'Other technicians' : 'Technicians'}>
                          {otherTechnicians.map((tech) => {
                            const category = tech.specialization || 'General';
                            return (
                              <option key={tech.id} value={tech.id} disabled={tech.isBusy}>
                                {tech.fullName} - {category}{tech.isBusy ? ' (Already Assigned)' : ''}
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                    </select>
                    <button className="btn btn-primary" type="submit" disabled={actionLoading}>Assign</button>
                  </div>
                  {technicians.length === 0 && !loadingTechnicians && (
                    <p style={{ marginTop: '0.4rem', color: '#fca5a5', fontSize: '0.8rem' }}>
                      No technicians available in the list right now.
                    </p>
                  )}
                  <p style={{ marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Recommendations are based on ticket category and technician specialization. Busy technicians are unavailable.
                  </p>
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

              {comments.map((comment) => {
                const canModifyComment = isCommentOwner(comment);
                const editing = editingComment.id === comment.id;
                const authorRole = String(comment.authorRole || 'UNKNOWN').toUpperCase();
                const roleAccent = authorRole === 'ADMIN'
                  ? { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', label: '#93c5fd' }
                  : authorRole === 'TECHNICIAN'
                    ? { bg: 'rgba(16,185,129,0.14)', border: 'rgba(16,185,129,0.35)', label: '#6ee7b7' }
                    : authorRole === 'USER'
                      ? { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: '#fcd34d' }
                      : { bg: 'var(--bg-secondary)', border: 'var(--border-color)', label: 'var(--text-secondary)' };
                const owner = isCommentOwner(comment);

                return (
                <div key={comment.id} style={{
                  border: `1px solid ${owner ? 'rgba(99,102,241,0.5)' : roleAccent.border}`,
                  borderRadius: '10px',
                  padding: '0.7rem',
                  background: owner ? 'rgba(99,102,241,0.08)' : roleAccent.bg,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{comment.authorId}</span>
                      <span className="badge" style={{ background: 'rgba(15,23,42,0.5)', color: roleAccent.label, border: `1px solid ${roleAccent.border}` }}>
                        {authorRole}
                      </span>
                      {owner && (
                        <span className="badge badge-in-progress" style={{ fontSize: '0.7rem' }}>
                          YOUR COMMENT
                        </span>
                      )}
                      <span className={`badge ${comment.visibility === 'INTERNAL' ? 'badge-info' : 'badge-open'}`}>{comment.visibility}</span>
                      {comment.pinned && <span className="badge badge-warning">PINNED</span>}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(comment.createdAt)}</span>
                  </div>

                  {!editing ? (
                    <p style={{ marginTop: '0.45rem', color: 'var(--text-primary)' }}>{comment.content}</p>
                  ) : (
                    <div style={{ marginTop: '0.45rem', display: 'grid', gap: '0.45rem' }}>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={editingComment.content}
                        onChange={(e) => setEditingComment((prev) => ({ ...prev, content: e.target.value }))}
                      />

                      {canModerate && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <select
                            className="form-control"
                            style={{ width: '170px' }}
                            value={editingComment.visibility}
                            onChange={(e) => setEditingComment((prev) => ({ ...prev, visibility: e.target.value }))}
                          >
                            <option value="PUBLIC">PUBLIC</option>
                            <option value="INTERNAL">INTERNAL</option>
                          </select>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <input
                              type="checkbox"
                              checked={editingComment.pinned}
                              onChange={(e) => setEditingComment((prev) => ({ ...prev, pinned: e.target.checked }))}
                            />
                            Pin comment
                          </label>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" type="button" onClick={() => handleSaveEditComment(comment)} disabled={actionLoading}>Save</button>
                        <button className="btn btn-secondary" type="button" onClick={handleCancelEditComment} disabled={actionLoading}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {canModifyComment && !editing && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        style={{ padding: '0.32rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => handleStartEditComment(comment)}
                        disabled={actionLoading}
                      >
                        Edit
                      </button>
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
              );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TicketDetailsPage;
