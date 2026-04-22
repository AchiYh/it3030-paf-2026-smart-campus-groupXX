import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API from '../../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

  useEffect(() => {
    // In a real app, you would fetch these from a statistics endpoint
    // For now we'll fetch all users and calculate basic statistics
    const fetchUsers = async () => {
      try {
        const response = await API.get('/users/admin/all');
        const users = response.data;
        const counts = { USER: 0, ADMIN: 0, TECHNICIAN: 0 };
        users.forEach(u => {
          if (counts[u.role] !== undefined) {
             counts[u.role]++;
          } else {
             counts[u.role] = 1;
          }
        });
        setStats([
          { name: 'Users', value: counts.USER || 0 },
          { name: 'Admins', value: counts.ADMIN || 0 },
          { name: 'Technicians', value: counts.TECHNICIAN || 0 },
        ]);
      } catch (err) {
        console.error("Failed to fetch user stats", err);
        // Fallback fake data if endpoint is not ready
        setStats([
          { name: 'Users', value: 12 },
          { name: 'Admins', value: 2 },
          { name: 'Technicians', value: 4 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Admin Dashboard</h2>
      
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        height: '400px'
      }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>System User Distribution</h3>
        {loading ? (
           <p>Loading charts...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--text-secondary)' }}/>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
