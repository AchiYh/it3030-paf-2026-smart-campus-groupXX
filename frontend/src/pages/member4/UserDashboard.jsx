import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import ticketService from '../../services/member3/ticketService';
import bookingService from '../../services/member2/bookingService';
import "./Dashboard.css";

export default function UserDashboard() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [time, setTime] = useState(new Date());
    const [stats, setStats] = useState({
        activeBookings: 0,
        openTickets: 0
    });

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fullName = user?.fullName || "User";
    const initials = fullName[0]?.toUpperCase() || "U";
    const roleLabel = (user?.role || "STUDENT").replace('ROLE_', '');
    const clockLabel = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const toReporterId = (email) => {
        const local = (email || '').split('@')[0] || 'usr';
        return local.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    };

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.email) return;
            try {
                const reporterId = toReporterId(user.email);
                
                // Fetch using unified services
                const [ticketsRes, bookingsRes] = await Promise.all([
                    ticketService.getTickets({ reportedBy: reporterId }),
                    bookingService.getMyBookings(user.email)
                ]);
                
                // Handle both direct array and { data: [] } response formats
                const ticketsList = ticketsRes.data?.data || ticketsRes.data || [];
                const bookingsList = bookingsRes.data?.data || bookingsRes.data || [];
                
                const openTickets = Array.isArray(ticketsList) 
                    ? ticketsList.filter(t => !['CLOSED', 'REJECTED'].includes(String(t.status).toUpperCase())).length
                    : 0;
                    
                const activeBookings = Array.isArray(bookingsList)
                    ? bookingsList.filter(b => ['APPROVED', 'PENDING'].includes(String(b.status).toUpperCase())).length
                    : 0;
                
                setStats({ openTickets, activeBookings });
            } catch (err) {
                console.error("Dashboard stats fetch failed:", err);
            }
        };
        if (isAuthenticated) fetchStats();
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="dashboard-content-only">
            <div className="stats-row">
                <div className="stat-widget">
                    <div className="stat-icon pulse-icon">🛡️</div>
                    <div>
                        <div className="stat-label">Security Protocol</div>
                        <div className="stat-value">ENCRYPTED</div>
                    </div>
                </div>
                <div className="stat-widget">
                    <div className="stat-icon">📈</div>
                    <div>
                        <div className="stat-label">System Pulse</div>
                        <div className="stat-value" style={{color: '#10b981'}}>HEALTHY (98%)</div>
                    </div>
                </div>
                <div className="stat-widget">
                    <div className="stat-icon">📡</div>
                    <div>
                        <div className="stat-label">Network Node</div>
                        <div className="stat-value">CAMPUS-NORTH-01</div>
                    </div>
                </div>
                <div className="stat-widget">
                    <div className="stat-icon">🕒</div>
                    <div>
                        <div className="stat-label">Local Time</div>
                        <div className="stat-value">{clockLabel}</div>
                    </div>
                </div>
            </div>

            <section className="command-banner" style={{ marginTop: '32px' }}>
                <div className="command-profile">
                    <div className="command-avatar-wrapper">
                        {user?.imageUrl ? <img src={user.imageUrl} alt="User" /> : initials}
                        <div className="status-indicator"></div>
                    </div>
                    <div className="command-info">
                        <div className="welcome-tag">WELCOME BACK,</div>
                        <h2>{fullName}</h2>
                        <div className="command-status">
                            <span className="inst-badge">INSTITUTIONAL SECURITY</span>
                            <span className="role-badge">VERIFIED {roleLabel}</span>
                        </div>
                    </div>
                </div>

                <div className="telemetry-panel">
                    <div className="telemetry-group">
                        <div className="tel-item">
                            <span className="tel-label">ACTIVE BOOKINGS</span>
                            <span className="tel-value">{String(stats.activeBookings).padStart(2, '0')}</span>
                        </div>
                        <div className="tel-divider"></div>
                        <div className="tel-item">
                            <span className="tel-label">OPEN TICKETS</span>
                            <span className="tel-value">{String(stats.openTickets).padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="telemetry-footer">
                        <div className="health-bar">
                            <div className="health-fill" style={{width: `${Math.min(((stats.activeBookings + stats.openTickets) / 10) * 100, 100)}%`}}></div>
                        </div>
                        <button className="telemetry-btn" onClick={() => navigate('/profile')}>MONITOR ANALYTICS</button>
                    </div>
                </div>
            </section>

            <div className="dash-grid" style={{ marginTop: '32px' }}>
                <div className="dash-card">
                    <div className="card-header">
                        <span className="card-tag">RESOURCE HUB</span>
                        <div className="card-icon">🏛️</div>
                    </div>
                    <div className="card-info">
                        <h3>Campus Directory</h3>
                        <p>Access study rooms, laboratories, and specialized equipment booking protocols.</p>
                    </div>
                    <Link to="/bookings" className="card-link">INITIATE REQUEST →</Link>
                </div>
                <div className="dash-card">
                    <div className="card-header">
                        <span className="card-tag">INCIDENT HUB</span>
                        <div className="card-icon">🎫</div>
                    </div>
                    <div className="card-info">
                        <h3>Maintenance Protocol</h3>
                        <p>Report technical failures or infrastructure issues to our technician pool.</p>
                    </div>
                    <Link to="/tickets/new" className="card-link">REPORT INCIDENT →</Link>
                </div>
                <div className="dash-card">
                    <div className="card-header">
                        <span className="card-tag">IDENTITY HUB</span>
                        <div className="card-icon">🛡️</div>
                    </div>
                    <div className="card-info">
                        <h3>Profile & Security</h3>
                        <p>Manage your institutional identity, security keys, and access authorizations.</p>
                    </div>
                    <Link to="/profile" className="card-link">MANAGE IDENTITY →</Link>
                </div>
            </div>
        </div>
    );
}
