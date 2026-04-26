import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import "./Dashboard.css";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await API.get('/user/admin/all');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await API.patch(`/user/admin/${userId}/role`, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error("Error updating role", error);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }
        try {
            await API.delete(`/user/admin/${userId}`);
            // Optimistically update UI
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Error deleting user", error);
            alert("Failed to delete user. Please try again.");
        }
    };

    return (
        <div className="dashboard-content-only">
            <section className="command-banner">
                <div className="command-info">
                    <h2>User Management</h2>
                    <div className="command-status">
                        <span>Institutional Security</span>
                        <span>IDENTITY PROTOCOL ACCESS</span>
                    </div>
                </div>
            </section>

            <div className="info-card" style={{ padding: '0', overflow: 'hidden', marginTop: '32px' }}>
                {loading ? (
                    <p style={{ padding: '2rem' }}>Synchronizing directory...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Identity</th>
                                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Email</th>
                                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Role</th>
                                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Authorization</th>
                                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px', fontWeight: 700, fontSize: '0.9rem' }}>{u.fullName}</td>
                                    <td style={{ padding: '16px', color: '#64748b', fontSize: '0.85rem' }}>{u.email}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ 
                                            fontSize: '0.7rem', 
                                            fontWeight: 800, 
                                            background: u.role === 'ADMIN' ? '#fef3c7' : '#f1f5f9', 
                                            color: u.role === 'ADMIN' ? '#92400e' : '#1e293b',
                                            padding: '4px 8px',
                                            borderRadius: '4px'
                                        }}>
                                            {u.role.replace('ROLE_', '')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <select 
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            value={u.role}
                                            style={{ 
                                                padding: '6px 12px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #e2e8f0',
                                                fontSize: '0.8rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            <option value="USER">STUDENT</option>
                                            <option value="TECHNICIAN">TECHNICIAN</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <button 
                                            onClick={() => handleDeleteUser(u.id, u.fullName)}
                                            style={{ 
                                                background: 'transparent',
                                                color: '#ef4444',
                                                border: '1px solid #ef4444',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => { e.target.style.background = '#ef4444'; e.target.style.color = '#fff'; }}
                                            onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ef4444'; }}
                                        >
                                            DELETE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
