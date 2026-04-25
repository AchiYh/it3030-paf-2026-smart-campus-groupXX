import React, { useState, useEffect } from 'react';
import API from '../../services/api';

function UserManagement() {
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
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating role", error);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>User Management</h2>
      <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
      }}>
        {loading ? (
          <p style={{ padding: '2rem' }}>Loading users...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Name</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Email</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Role</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{user.fullName}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{user.email}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-primary' : user.role === 'TECHNICIAN' ? 'badge-info' : 'badge-secondary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <select 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      value={user.role}
                      className="form-control"
                      style={{ padding: '0.25rem', width: 'auto', display: 'inline-block' }}
                    >
                      <option value="USER">USER</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
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

export default UserManagement;
