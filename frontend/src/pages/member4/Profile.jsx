import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import './Profile.css';

function normalizeRole(role) {
    const r = String(role || '').replace('ROLE_', '').toUpperCase();
    if (r === 'USER') return 'STUDENT';
    return r;
}

export default function Profile() {
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const fileInputRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [editingField, setEditingField] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');

    const { logout } = useAuth();

    const handleSelfDelete = async () => {
        if (deleteConfirmEmail !== profile?.email) return;
        
        setSaving(true);
        try {
            await api.delete('/user/me');
            logout(); // Clear local session
            navigate('/signup', { state: { message: 'Your account has been permanently deleted.' } });
        } catch (err) {
            alert('Failed to delete account. Please contact system administration.');
        } finally {
            setSaving(false);
            setShowDeleteModal(false);
        }
    };

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

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/user/upload-profile-image', formData);
            setProfile(prev => ({ ...prev, profilePicture: res.data.imageUrl }));
            updateUser({ profilePicture: res.data.imageUrl });
        } catch (err) {
            alert('Failed to upload image');
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";
        const rootUrl = baseUrl.replace('/api', '');
        return rootUrl + url;
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert('Passwords do not match');
            return;
        }
        setSaving(true);
        try {
            const res = await api.put('/user/update-password', passwordData);
            alert(res.data.message || 'Security credentials updated successfully');
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Update failed - check current password';
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (field, value) => {
        setEditingField(field);
        setEditValues({ [field]: value || '' });
    };

    const saveField = async (field) => {
        setSaving(true);
        try {
            const val = editValues[field];
            await api.put('/user/update-profile-field', { field, value: val });
            setProfile(prev => ({ ...prev, [field]: val }));
            if (field === 'fullName') updateUser({ fullName: val });
            setEditingField(null);
        } catch (err) {
            alert('Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (!profile && !error) return <div className="loading-state">Synchronizing Institutional Profile...</div>;

    const fullName = profile?.fullName || "User";
    const initials = (fullName[0] || 'U').toUpperCase();
    const roleLabel = normalizeRole(profile?.role);
    
    const emailPrefix = profile?.email?.split('@')[0]?.toUpperCase();
    const studentId = (profile?.studentId && profile.studentId !== "IT2XXXXXXX") 
        ? profile.studentId 
        : emailPrefix || "IT2XXXXXXX";

    return (
        <div className='profile-content-only'>
            <div className="profile-header-grid">
                <section className='profile-identity-card'>
                    <div className='avatar-container-square'>
                        <div className='avatar-square' onClick={() => fileInputRef.current.click()}>
                            {profile?.profilePicture ? <img src={getImageUrl(profile.profilePicture)} alt="Avatar" /> : initials}
                            <div className='upload-overlay'>
                                <span>CHANGE PHOTO</span>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handlePhotoUpload} accept="image/*" />
                    </div>
                    <div className='identity-text-square'>
                        <h1>{fullName}</h1>
                        <p className="email-label">{profile?.email}</p>
                        <div className='badge-row-square'>
                            <span className='role-badge-square'>{roleLabel}</span>
                            <span className='status-badge-square'>VALIDATED</span>
                        </div>
                    </div>
                </section>

                <section className='access-level-card'>
                    <h3><span className="icon">🔒</span> ACCESS LEVEL</h3>
                    <p>Your account is protected by institution-grade encryption. Ensure your password remains private.</p>
                    <div className='last-login'>
                        <span>LAST LOGIN</span>
                        <strong>{new Date().toLocaleDateString()} (Sri Lanka)</strong>
                    </div>
                    <div className='shield-bg'>🛡️</div>
                </section>
            </div>

            <div className='profile-details-grid' style={{ marginTop: '32px' }}>
                {/* IDENTITY DETAILS */}
                <div className='details-section-card'>
                    <h3><span className="icon">👤</span> IDENTITY DETAILS</h3>
                    <div className='input-grid'>
                        <ProfileInput label="FULL NAME" value={fullName} icon="👤" onEdit={() => startEdit('fullName', fullName)} isEditing={editingField === 'fullName'} editValue={editValues.fullName} onChange={(v) => setEditValues({fullName: v})} onSave={() => saveField('fullName')} onCancel={() => setEditingField(null)} saving={saving} />
                        <ProfileInput label="INSTITUTIONAL EMAIL" value={profile?.email} icon="📧" locked={true} />
                        <ProfileInput label="PHONE NUMBER" value={profile?.phone} icon="📞" onEdit={() => startEdit('phone', profile?.phone)} isEditing={editingField === 'phone'} editValue={editValues.phone} onChange={(v) => setEditValues({phone: v})} onSave={() => saveField('phone')} onCancel={() => setEditingField(null)} saving={saving} />
                        <ProfileInput label="STUDENT ID" value={studentId} icon="🆔" locked={true} />
                    </div>
                    <div className="card-actions-row">
                        <button className='save-all-btn'><span className="btn-icon">💾</span> SAVE IDENTITY CHANGES</button>
                    </div>
                </div>

                {/* PASSWORD & SECURITY - UPDATED FOR CLEAR UI */}
                <div className='details-section-card'>
                    <h3><span className="icon">🔓</span> PASSWORD & SECURITY</h3>
                    <form className='password-form-grid' onSubmit={handlePasswordUpdate}>
                        <div className='password-grid-container'>
                            <SecurityInput 
                                label="CURRENT PASSWORD" 
                                placeholder="Required for verification"
                                value={passwordData.current}
                                onChange={v => setPasswordData({...passwordData, current: v})}
                            />
                            <div className='divider-line'></div>
                            <SecurityInput 
                                label="NEW PASSWORD" 
                                placeholder="Min. 8 characters"
                                value={passwordData.new}
                                onChange={v => setPasswordData({...passwordData, new: v})}
                            />
                            <SecurityInput 
                                label="CONFIRM NEW PASSWORD" 
                                placeholder="Verify password"
                                value={passwordData.confirm}
                                onChange={v => setPasswordData({...passwordData, confirm: v})}
                            />
                        </div>
                        <div className="card-actions-row">
                            <button type="submit" className='outline-security-btn' disabled={saving}>
                                {saving ? 'VERIFYING...' : 'UPDATE SECURITY CREDENTIALS'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* DANGER ZONE - SELF DELETION */}
            <div className='details-section-card danger-zone-card' style={{ marginTop: '32px', border: '1px solid #fee2e2' }}>
                <h3 style={{ color: '#ef4444' }}><span className="icon">⚠️</span> DANGER ZONE</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <p style={{ fontWeight: 700, margin: 0, color: '#1a2a44' }}>Permanently Close Institutional Account</p>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>This action is irreversible. All your bookings, tickets, and identity data will be permanently purged.</p>
                    </div>
                    <button className='delete-account-btn' onClick={() => setShowDeleteModal(true)}>DELETE MY IDENTITY</button>
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && (
                <div className='modal-overlay-danger'>
                    <div className='modal-card-danger'>
                        <div className='modal-header-danger'>
                            <span className='danger-icon'>🚫</span>
                            <h2>Permanent Identity Deletion</h2>
                        </div>
                        <p>This will permanently purge your account <strong>{profile?.email}</strong> and all associated data from the FacultyFlow database.</p>
                        
                        <div className='confirm-input-area'>
                            <label>Type your email address to confirm:</label>
                            <input 
                                type="text" 
                                placeholder={profile?.email} 
                                value={deleteConfirmEmail} 
                                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                                className="confirm-email-input"
                            />
                        </div>

                        <div className='modal-actions-danger'>
                            <button className='cancel-modal-btn' onClick={() => { setShowDeleteModal(false); setDeleteConfirmEmail(''); }}>KEEP MY ACCOUNT</button>
                            <button 
                                className='final-delete-btn' 
                                disabled={deleteConfirmEmail !== profile?.email || saving}
                                onClick={handleSelfDelete}
                            >
                                {saving ? 'PURGING...' : 'PERMANENTLY DELETE ACCOUNT'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProfileInput({ label, value, icon, locked, onEdit, isEditing, editValue, onChange, onSave, onCancel, saving, placeholder }) {
    return (
        <div className='profile-input-wrapper'>
            <label>{label}</label>
            <div className={`input-container ${locked ? 'locked' : ''} ${isEditing ? 'editing' : ''}`}>
                <span className='input-icon'>{icon}</span>
                {isEditing ? (
                    <input value={editValue} onChange={e => onChange(e.target.value)} autoFocus placeholder={placeholder} className="inline-edit-input" />
                ) : (
                    <span className='display-value'>{value || 'Not provided'}</span>
                )}
                {!locked && !isEditing && <button className='edit-badge-btn' onClick={onEdit}>EDIT</button>}
                {isEditing && (
                    <div className='edit-actions-mini'>
                        <button className='confirm-btn-mini' onClick={onSave} disabled={saving}>✔</button>
                        <button className='cancel-btn-mini' onClick={onCancel}>✖</button>
                    </div>
                )}
            </div>
        </div>
    );
}

function SecurityInput({ label, placeholder, value, onChange }) {
    return (
        <div className='profile-input-wrapper'>
            <label>{label}</label>
            <div className='input-container security'>
                <span className='input-icon'>🔑</span>
                <input 
                    type="password" 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                    placeholder={placeholder} 
                    className="inline-edit-input"
                    required
                />
            </div>
        </div>
    );
}
