import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api';
import './Profile.css';

const YEAR_OPTIONS = [
    { value: 'FIRST', label: 'First Year' },
    { value: 'SECOND', label: 'Second Year' },
    { value: 'THIRD', label: 'Third Year' },
    { value: 'FOURTH', label: 'Fourth Year' },
];

const SEMESTER_OPTIONS = [
    { value: 'SEM1', label: 'Semester 1' },
    { value: 'SEM2', label: 'Semester 2' },
];

function normalizeRole(role) {
    return String(role || '').replace('ROLE_', '').toUpperCase();
}

function getRoleHomePath(role) {
    const normalized = normalizeRole(role);
    if (normalized.includes('ADMIN')) return '/admin-dashboard';
    if (normalized.includes('TECHNICIAN')) return '/tech-dashboard';
    return '/dashboard';
}

function getRoleNavigationLinks(role) {
    const normalized = normalizeRole(role);
    if (normalized.includes('ADMIN')) {
        return [
            { label: 'User Management', description: 'Manage all accounts', to: '/admin/users', icon: 'users' },
            { label: 'System Logs', description: 'Security audit logs', to: '/admin/logs', icon: 'logs' },
        ];
    }
    return [
        { label: 'My Bookings', description: 'View your history', to: '/bookings/my', icon: 'history' },
        { label: 'Help Desk', description: 'Support tickets', to: '/ticketing/overview', icon: 'ticket' },
    ];
}

function renderRoleNavIcon(icon) {
    return (
        <svg viewBox='0 0 24 24' width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
        </svg>
    );
}

export default function Profile() {
    const navigate = useNavigate();
    const location = useLocation();

    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [editingField, setEditingField] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [saving, setSaving] = useState(false);
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await api.get('/user/me');
                setProfile(response.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError('Failed to load profile.');
                }
            }
        };
        loadProfile();
    }, [navigate]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        // Implement logout logic if needed, or just redirect
        navigate('/login');
    };

    const fullName = profile?.fullName || "User";
    const roleLabel = normalizeRole(profile?.role);
    const initials = (fullName[0] || 'U').toUpperCase();
    
    const calendarLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const clockLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const calculateCompletion = () => {
        if (!profile) return 0;
        const fields = [profile.fullName, profile.email, profile.phone, profile.year, profile.semester];
        const filled = fields.filter(f => f && String(f).trim()).length;
        return Math.round((filled / fields.length) * 100);
    };

    const startEdit = (field, value) => {
        setEditingField(field);
        setEditValues({ [field]: value || '' });
    };

    const saveField = async (field) => {
        setSaving(true);
        try {
            await api.put('/user/update-profile-field', {
                field,
                value: editValues[field]
            });
            setProfile(prev => ({ ...prev, [field === 'phone' ? 'phone' : field]: editValues[field] }));
            setEditingField(null);
        } catch (err) {
            alert('Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (!profile && !error) return <div className="loading">Loading...</div>;

    const completion = calculateCompletion();
    const navLinks = getRoleNavigationLinks(profile?.role);

    const detailsRows = [
        { label: 'Full Name', value: fullName, field: 'fullName' },
        { label: 'Email', value: profile?.email, field: 'email', locked: true },
        { label: 'Phone', value: profile?.phone, field: 'phone' },
        { label: 'Year', value: profile?.year, field: 'year' },
        { label: 'Semester', value: profile?.semester, field: 'semester' },
    ];

    return (
        <div className='profile-page'>
            <div className='profile-page__canvas' />
            <div className='profile-workbench'>
                <aside className='profile-sidebar'>
                    <div className='sidebar-brand'>
                        <span className='brand-avatar'>{initials}</span>
                        <div className='brand-info'>
                            <strong>{fullName}</strong>
                            <small>{profile?.email}</small>
                        </div>
                    </div>

                    <nav className='sidebar-nav'>
                        <p className='sidebar-label'>Quick Navigation</p>
                        <Link className='sidebar-link' to={getRoleHomePath(profile?.role)}>Home</Link>
                        <Link className='sidebar-link active' to='/profile'>Profile</Link>
                        <Link className='sidebar-link' to='/settings'>Settings</Link>
                    </nav>

                    <div className='sidebar-card'>
                        <p className='sidebar-label'>Profile Status</p>
                        <div className='sidebar-item'>
                            <span>Completion</span>
                            <strong>{completion}%</strong>
                        </div>
                        <div className='sidebar-item'>
                            <span>Role</span>
                            <strong>{roleLabel}</strong>
                        </div>
                    </div>

                    <div className='sidebar-calendar-card'>
                        <p className='sidebar-label'>Calendar</p>
                        <div className='sidebar-calendar-header'>
                            <strong>{calendarLabel}</strong>
                        </div>
                        <div className='sidebar-clock'>{clockLabel}</div>
                    </div>
                </aside>

                <main className='profile-main'>
                    <header className='profile-header'>
                        <div className='profile-header__title'>
                            <h1>Account Profile</h1>
                            <p>Manage your academic and personal information.</p>
                            
                            <div className='profile-role-nav-inline'>
                                {navLinks.map(link => (
                                    <Link key={link.to} className='profile-role-nav-link' to={link.to}>
                                        <span className='profile-role-nav-icon'>{renderRoleNavIcon(link.icon)}</span>
                                        <span className='profile-role-nav-text'>
                                            <strong>{link.label}</strong>
                                            <small>{link.description}</small>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className='profile-header__actions'>
                            <button className='btn btn-danger' onClick={handleLogout}>Logout</button>
                        </div>
                    </header>

                    <div className='profile-grid'>
                        <article className='card hero-card'>
                            <div className='hero-cover' />
                            <div className='hero-body'>
                                <div className='hero-avatar'><span>{initials}</span></div>
                                <div className='hero-text'>
                                    <h2>{fullName}</h2>
                                    <p>{profile?.email}</p>
                                    <span className='role-chip'>{roleLabel}</span>
                                </div>
                            </div>
                        </article>

                        <article className='card completion-card'>
                            <div className='completion-header'>
                                <h3>Completion</h3>
                                <strong>{completion}%</strong>
                            </div>
                            <div className='completion-bar'><span style={{ width: `${completion}%` }} /></div>
                        </article>

                        <article className='card details-card'>
                            <h3>Personal Information</h3>
                            <div className='details-list'>
                                {detailsRows.map(row => (
                                    <div key={row.field} className='details-row'>
                                        <div className='row-head'><span>{row.label}</span></div>
                                        {editingField === row.field ? (
                                            <div className='edit-row'>
                                                <input 
                                                    value={editValues[row.field] || ''} 
                                                    onChange={e => setEditValues({[row.field]: e.target.value})}
                                                />
                                                <button className='btn btn-primary' onClick={() => saveField(row.field)} disabled={saving}>Save</button>
                                                <button className='btn btn-soft' onClick={() => setEditingField(null)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <div className='view-row'>
                                                <strong>{row.value || 'Not set'}</strong>
                                                {!row.locked && (
                                                    <button className='edit-link' onClick={() => startEdit(row.field, row.value)}>Edit</button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </article>
                    </div>
                </main>
            </div>
        </div>
    );
}
