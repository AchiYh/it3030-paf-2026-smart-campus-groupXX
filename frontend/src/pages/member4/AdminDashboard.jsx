import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import "./Dashboard.css";
import "./Profile.css";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAdmin } = useAuth();

    const [stats, setStats] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());

    const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            navigate("/", { replace: true });
        }
    }, [isAdmin, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Stats
                const userRes = await API.get('/user/admin/all');
                const users = userRes.data;
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

                // Fetch Security Logs
                const logRes = await API.get('/user/admin/logs');
                setLogs(logRes.data);

            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setStats([
                    { name: 'Users', value: 12 },
                    { name: 'Admins', value: 2 },
                    { name: 'Technicians', value: 4 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const roleLabel = "ADMIN";
    const dashboardTitle = "Admin Dashboard";
    const dashboardSubtitle = "Welcome back to your administration portal.";
    const homePath = "/";
    const homeLabel = "Dashboard";
    
    const fullName = user?.fullName || user?.email?.split('@')[0] || "Admin";
    const initials = fullName[0]?.toUpperCase() || "A";
    const currentDay = time.getDate();
    const calendarLabel = time.toLocaleString("default", { month: "long", year: "numeric" });
    const clockLabel = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const calendarYear = time.getFullYear();
    const calendarMonth = time.getMonth();
    const calendarFirstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const calendarDaysCount = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const calendarCells = [
        ...Array.from({ length: calendarFirstDay }, () => null),
        ...Array.from({ length: calendarDaysCount }, (_, index) => index + 1),
    ];

    const formatTimestamp = (ts) => {
        if (!ts) return "";
        const date = new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " | " + date.toLocaleDateString();
    };

    return (
        <div className="md-screen">
            <div className="md-layout">
                <aside className="md-sidebar profile-sidebar">
                    <div className="sidebar-brand">
                        <span
                            className="brand-avatar"
                            style={{ background: "linear-gradient(130deg, #ed7b3f, #ffc292)", color: "#fff" }}
                        >
                            {initials}
                        </span>
                        <div className="brand-info">
                            <strong>{fullName}</strong>
                            <small>{user?.email || "No email"}</small>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <p className="sidebar-label">Quick Navigation</p>
                        <Link className="sidebar-link active" to={homePath}>
                            {homeLabel}
                        </Link>
                        <Link className={`sidebar-link ${location.pathname === '/users' ? 'active' : ''}`} to="/users">
                            User Management
                        </Link>
                        <Link className="sidebar-link" to="/profile">
                            Profile
                        </Link>
                        <Link className="sidebar-link" to="/settings">
                            Settings
                        </Link>
                    </nav>

                    <div className="sidebar-card">
                        <p className="sidebar-label">Profile Status</p>
                        <div className="sidebar-item">
                            <span>Role</span>
                            <strong>{roleLabel}</strong>
                        </div>
                        <div className="sidebar-item">
                            <span>Status</span>
                            <strong style={{color: '#10b981'}}>Active</strong>
                        </div>
                    </div>

                    <div className="sidebar-calendar-card">
                        <p className="sidebar-label">Calendar</p>
                        <div className="sidebar-calendar-header">
                            <strong>{calendarLabel}</strong>
                            <span className="sidebar-today-badge">Today {currentDay}</span>
                        </div>
                        <div className="sidebar-clock">{clockLabel}</div>
                        <div className="sidebar-calendar-grid">
                            <div className="sidebar-calendar-weekdays">
                                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                                    <span key={day} className="weekday">{day}</span>
                                ))}
                            </div>
                            <div className="sidebar-calendar-days">
                                {calendarCells.map((day, index) => (
                                    <span
                                        key={`day-${index}`}
                                        className={`day${day === null ? " empty" : ""}${day === currentDay ? " today" : ""}`}
                                        aria-hidden={day === null}
                                    >
                                        {day ?? ""}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="md-main">
                    <header className="md-topbar">
                        <div className="md-topbar-left">
                            <h1 className="md-title">{dashboardTitle}</h1>
                            <p className="md-subtitle">{dashboardSubtitle}</p>
                        </div>
                        <div className="md-topbar-actions">
                            <button className="md-btn-logout" onClick={handleLogout}>Logout</button>
                        </div>
                    </header>

                    <div className="md-content-scroll">
                        {/* Distribution Panel */}
                        <div className="md-panel" style={{ padding: '24px' }}>
                            <div className="md-panel-header" style={{ marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>System User Distribution</h2>
                            </div>
                            <div style={{ height: '300px' }}>
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
                                                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Audit Logs Panel */}
                        <div className="md-panel" style={{ padding: '24px' }}>
                            <div className="md-panel-header" style={{ marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Security & Audit Logs</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Real-time monitoring of system activities</p>
                            </div>
                            <div className="table-container" style={{ border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#1e293b', textAlign: 'left' }}>
                                            <th style={{ padding: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>USER</th>
                                            <th style={{ padding: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>ACTION</th>
                                            <th style={{ padding: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>TIMESTAMP</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.length > 0 ? logs.map((log) => (
                                            <tr key={log.id} style={{ borderBottom: '1px solid #334155' }}>
                                                <td style={{ padding: '12px', fontSize: '0.85rem' }}>{log.userEmail}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span className={`badge ${log.action === 'LOGIN' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '0.85rem', color: '#64748b' }}>{formatTimestamp(log.timestamp)}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No recent activities found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
