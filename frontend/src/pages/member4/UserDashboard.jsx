<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import "./Dashboard.css";
import "./Profile.css";

export default function UserDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();

    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const roleLabel = user?.role || "USER";
    const dashboardTitle = "User Portal";
    const dashboardSubtitle = "Welcome back to your unified campus portal.";
    const homePath = "/";
    const homeLabel = "Home";
    
    const fullName = user?.fullName || user?.email?.split('@')[0] || "User";
    const initials = fullName[0]?.toUpperCase() || "U";
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
                        <Link className="sidebar-link" to="/tickets/new">
                            Create Incident
                        </Link>
                        <Link className="sidebar-link" to="/tickets/list">
                            My Tickets
                        </Link>
                        <Link className="sidebar-link" to="/profile">
                            Profile
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', padding: '2rem' }}>
                            {/* Quick Actions */}
                            <div style={{
                                background: 'var(--bg-secondary)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                            }}>
                                <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Quick Actions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <Link to="/tickets/new" className="btn btn-primary" style={{ textAlign: 'center' }}>
                                        Create Incident Ticket
                                    </Link>
                                    <Link to="/tickets/list" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                                        My Tickets
                                    </Link>
                                </div>
                            </div>

                            {/* Notifications Overview */}
                            <div style={{
                                background: 'var(--bg-secondary)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                            }}>
                                <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Recent Activity</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Use the notification bell to view full alerts.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
=======
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function UserDashboard() {
  const { user } = useAuth();
  
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Welcome, {user?.email}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Quick Actions */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/tickets/new" className="btn btn-primary" style={{ textAlign: 'center' }}>
              Create Incident Ticket
            </Link>
            <Link to="/tickets/list" className="btn btn-secondary" style={{ textAlign: 'center' }}>
              My Tickets
            </Link>
          </div>
        </div>

        {/* Notifications Overview */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Recent Activity</h3>
          <p style={{ color: 'var(--text-muted)' }}>Use the notification bell to view full alerts.</p>
        </div>

      </div>
    </div>
  );
}

export default UserDashboard;
>>>>>>> develop-branch
