import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import './Infrastructure.css';

export default function InfrastructurePage() {
    const { isAdmin } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ type: 'All', status: 'All', location: 'All' });

    const loadResources = async () => {
        try {
            const res = await api.get('/infrastructure');
            setResources(res.data);
        } catch (err) {
            console.error("Failed to load infrastructure", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadResources();
    }, []);

    const filteredResources = resources.filter(r => {
        const matchesSearch = r.name?.toLowerCase().includes(search.toLowerCase()) || 
                             r.location?.toLowerCase().includes(search.toLowerCase());
        const matchesType = filters.type === 'All' || r.type === filters.type;
        const matchesStatus = filters.status === 'All' || r.status === filters.status;
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleSuccess = () => {
        loadResources();
        setShowModal(false);
        setEditingResource(null);
    };

    const handleEdit = (resource) => {
        setEditingResource(resource);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resource?")) return;
        try {
            await api.delete(`/infrastructure/${id}`);
            setResources(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert("Failed to delete resource");
        }
    };

    const toggleStatus = async (resource) => {
        const newStatus = resource.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
        try {
            await api.put(`/infrastructure/${resource.id}`, { ...resource, status: newStatus });
            setResources(prev => prev.map(r => r.id === resource.id ? { ...r, status: newStatus } : r));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    return (
        <div className="infrastructure-container">
            <header className="infra-header">
                <div className="infra-search-bar">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search resource infrastructure by name or location..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {isAdmin && (
                        <button className="commit-btn" onClick={() => { setEditingResource(null); setShowModal(true); }}>
                            <span>➕</span> ADD RESOURCE
                        </button>
                    )}
                </div>

                <div className="infra-filters">
                    <FilterGroup label="RESOURCE TYPE" value={filters.type} options={['All', 'Room', 'Equipment', 'Laboratory']} onChange={(v) => setFilters({...filters, type: v})} />
                    <FilterGroup label="STATUS" value={filters.status} options={['All', 'AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE']} onChange={(v) => setFilters({...filters, status: v})} />
                    <FilterGroup label="LOCATION" value={filters.location} options={['All', 'Building A', 'Building B', 'IT Store']} onChange={(v) => setFilters({...filters, location: v})} />
                    <FilterGroup label="MIN. CAPACITY" value="Any" options={['Any', '10+', '20+', '50+']} />
                </div>
            </header>

            {loading ? (
                <div className="loading-state">Synchronizing Infrastructure Assets...</div>
            ) : (
                <div className="infra-grid">
                    {filteredResources.map(resource => (
                        <ResourceCard 
                            key={resource.id} 
                            resource={resource} 
                            isAdmin={isAdmin}
                            onEdit={() => handleEdit(resource)}
                            onDelete={() => handleDelete(resource.id)}
                            onToggle={() => toggleStatus(resource)}
                        />
                    ))}
                </div>
            )}

            {showModal && (
                <AddResourceModal 
                    onClose={() => { setShowModal(false); setEditingResource(null); }} 
                    onSuccess={handleSuccess}
                    initialData={editingResource}
                />
            )}
        </div>
    );
}

function FilterGroup({ label, value, options, onChange }) {
    return (
        <div className="filter-group">
            <label>{label}</label>
            <select className="filter-select" value={value} onChange={(e) => onChange(e.target.value)}>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );
}

const getImageUrlHelper = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('blob')) return url;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";
    const rootUrl = baseUrl.replace('/api', '');
    return rootUrl + url;
};

function ResourceCard({ resource, isAdmin, onEdit, onDelete, onToggle }) {
    const isAvailable = resource.status === 'AVAILABLE';
    return (
        <div className="infra-card">
            <div className="infra-card-image">
                <img src={getImageUrlHelper(resource.imageUrl) || 'https://via.placeholder.com/400x200?text=No+Image'} alt={resource.name} />
                <span className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}>
                    {resource.status}
                </span>
            </div>
            <div className="infra-card-content">
                <div className="type-tag">
                    <span>{resource.type === 'Room' ? '🏢' : '⚙️'}</span>
                    {resource.type}
                </div>
                <h3>{resource.name}</h3>
                <p className="location-text">{resource.location}</p>
                <div className="infra-card-footer">
                    <div className="footer-item">
                        <label>CAPACITY</label>
                        <span>{resource.capacity || 'N/A'} PAX</span>
                    </div>
                    <div className="footer-item">
                        <label>ACTIVE HOURS</label>
                        <span>{resource.availableFrom || '08:00'} - {resource.availableUntil || '18:00'}</span>
                    </div>
                </div>

                {isAdmin && (
                    <div className="card-admin-actions">
                        <span className="view-details-link">VIEW CORE DETAILS</span>
                        <div className="action-buttons-group">
                            <button className={`action-circle-btn toggle ${isAvailable ? 'on' : 'off'}`} onClick={onToggle} title="Toggle Availability">
                                ⏻
                            </button>
                            <button className="action-circle-btn edit" onClick={onEdit} title="Edit Resource">
                                ✎
                            </button>
                            <button className="action-circle-btn delete" onClick={onDelete} title="Delete Resource">
                                🗑
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function AddResourceModal({ onClose, onSuccess, initialData }) {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        type: initialData?.type || 'Room',
        location: initialData?.location || '',
        capacity: initialData?.capacity || '',
        status: initialData?.status || 'AVAILABLE',
        availableFrom: initialData?.availableFrom || '08:00',
        availableUntil: initialData?.availableUntil || '18:00'
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let finalImageUrl = initialData?.imageUrl || '';
            if (selectedFile) {
                const imgData = new FormData();
                imgData.append('file', selectedFile);
                const uploadRes = await api.post('/user/upload-profile-image', imgData);
                finalImageUrl = uploadRes.data.imageUrl;
            }

            if (initialData) {
                await api.put(`/infrastructure/${initialData.id}`, { ...formData, imageUrl: finalImageUrl });
            } else {
                await api.post('/infrastructure', { ...formData, imageUrl: finalImageUrl });
            }
            onSuccess();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Failed to save resource";
            alert(`Error: ${errorMsg}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="infra-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ color: '#1a2a44', fontSize: '1.5rem', marginBottom: '32px' }}>
                        {initialData ? 'EDIT RESOURCE' : 'ADD NEW RESOURCE'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="upload-zone" onClick={() => fileInputRef.current.click()}>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
                        {previewUrl ? (
                            <img src={getImageUrlHelper(previewUrl)} alt="Preview" className="upload-preview-img" />
                        ) : (
                            <>
                                <span style={{ fontSize: '2.5rem' }}>📤</span>
                                <span className="upload-main-text">UPLOAD RESOURCE IMAGE</span>
                                <p className="upload-sub-text">PNG, JPG OR WEBP (MAX. 5MB)</p>
                            </>
                        )}
                    </div>

                    <div className="infra-form-grid">
                        <div className="infra-form-group">
                            <label>RESOURCE NAME *</label>
                            <input className="infra-input" placeholder="e.g. Main Auditorium" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="infra-form-group">
                            <label>SYSTEM CATEGORY *</label>
                            <select className="infra-input" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                <option value="Room">Room / Hall</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Laboratory">Laboratory</option>
                            </select>
                        </div>
                        <div className="infra-form-group">
                            <label>INSTITUTIONAL LOCATION *</label>
                            <input className="infra-input" placeholder="e.g. Building A - Floor 2" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
                        </div>
                        <div className="infra-form-group">
                            <label>UNIT CAPACITY *</label>
                            <input className="infra-input" placeholder="e.g. 50" type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} required />
                        </div>
                        <div className="infra-form-group">
                            <label>OPERATIONAL STATUS *</label>
                            <select className="infra-input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                <option value="AVAILABLE">System Active</option>
                                <option value="UNAVAILABLE">Maintenance Mode</option>
                            </select>
                        </div>
                        <div className="infra-form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label>AVAILABLE FROM *</label>
                                <input className="infra-input" type="time" value={formData.availableFrom} onChange={(e) => setFormData({...formData, availableFrom: e.target.value})} />
                            </div>
                            <div>
                                <label>AVAILABLE UNTIL *</label>
                                <input className="infra-input" type="time" value={formData.availableUntil} onChange={(e) => setFormData({...formData, availableUntil: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-pill-btn" onClick={onClose}>CANCEL</button>
                        <button type="submit" className="commit-btn" disabled={saving}>
                            {saving ? 'SAVING...' : (
                                <>
                                    <span className="btn-icon">💾</span> {initialData ? 'UPDATE RESOURCE' : 'COMMIT RESOURCE'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
