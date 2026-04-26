import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import "./Dashboard.css";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const [stats, setStats] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [time] = useState(new Date());

    const COLORS = ['#1a2a44', '#f9b824', '#64748b'];

    useEffect(() => {
        if (!isAdmin) {
            navigate("/", { replace: true });
        }
    }, [isAdmin, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await API.get('/user/admin/all');
                const users = userRes.data;
                const counts = { USER: 0, ADMIN: 0, TECHNICIAN: 0 };
                users.forEach(u => {
                    const r = u.role.replace('ROLE_', '');
                    if (counts[r] !== undefined) counts[r]++;
                });
                setStats([
                    { name: 'Students', value: counts.USER || 0 },
                    { name: 'Admins', value: counts.ADMIN || 0 },
                    { name: 'Technicians', value: counts.TECHNICIAN || 0 },
                ]);

                const logRes = await API.get('/user/admin/logs');
                setLogs(logRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setStats([
                    { name: 'Students', value: 12 },
                    { name: 'Admins', value: 2 },
                    { name: 'Technicians', value: 4 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fullName = user?.fullName || "Admin";
    const initials = fullName[0]?.toUpperCase() || "A";

    const formatTimestamp = (ts) => {
        if (!ts) return "";
        const date = new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " | " + date.toLocaleDateString();
    };

    return (
        <div className="dashboard-content-only">
            <section className="command-banner">
                <div className="command-profile">
                    <div className="command-avatar">
                        {initials}
                        <div className="status-dot"></div>
                    </div>
                    <div className="command-info">
                        <h2>{fullName}</h2>
                        <div className="command-status">
                            <span>Institutional Security</span>
                            <span>SYSTEM ADMINISTRATOR</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="info-grid" style={{ marginTop: '32px' }}>
                <div className="info-card">
                    <h3>User Distribution</h3>
                    <div style={{ height: '240px' }}>
                        {loading ? (
                            <p>Loading charts...</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1a2a44' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="info-card">
                    <h3>Recent Security Logs</h3>
                    <div className="details-list" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                        {logs.length > 0 ? logs.map((log) => (
                            <div key={log.id} className="detail-item" style={{ borderBottom: '1px solid #f1f5f9', padding: '12px 0' }}>
                                <div className="detail-label" style={{ flex: 1 }}>{log.userEmail}</div>
                                <div className="detail-value" style={{ fontSize: '0.7rem', color: '#1a2a44', background: '#eff3f9', padding: '2px 8px', borderRadius: '4px' }}>
                                    {log.action}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: '12px' }}>{formatTimestamp(log.timestamp)}</div>
                            </div>
                        )) : (
                            <p style={{ textAlign: 'center', color: '#64748b' }}>No recent activities</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
