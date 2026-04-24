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
        const fetchUsers = async () => {
            try {
                const response = await API.get('/user/admin/all');
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
                        <div className="md-panel md-resource-wrapper" style={{ padding: '2rem' }}>
                            <div className="md-panel-header" style={{ marginBottom: '1.5rem' }}>
                                <h2>System User Distribution</h2>
                            </div>
                            <div className="md-panel-body p-0" style={{ height: '400px' }}>
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
                    </div>
                </main>
            </div>
        </div>
    );
}
