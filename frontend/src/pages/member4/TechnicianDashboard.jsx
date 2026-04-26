import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import "./Dashboard.css";

export default function TechnicianDashboard() {
    const navigate = useNavigate();
    const { user, isTechnician } = useAuth();
    const [time] = useState(new Date());

    useEffect(() => {
        if (!isTechnician) {
            navigate("/", { replace: true });
        }
    }, [isTechnician, navigate]);

    const fullName = user?.fullName || "Technician";
    const initials = fullName[0]?.toUpperCase() || "T";

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
                            <span>CERTIFIED TECHNICIAN</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="info-grid" style={{ marginTop: '32px' }}>
                <div className="info-card">
                    <h3>Task Management</h3>
                    <div className="details-list">
                        <div className="detail-item">
                            <div className="detail-label">Pending Tickets</div>
                            <div className="detail-value" style={{color: '#f9b824'}}>0</div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-label">Resolved Today</div>
                            <div className="detail-value" style={{color: '#10b981'}}>0</div>
                        </div>
                        <Link to="/tickets/list" className="save-btn" style={{textDecoration: 'none', textAlign: 'center', padding: '12px', marginTop: '12px'}}>
                            VIEW ASSIGNED QUEUE
                        </Link>
                    </div>
                </div>

                <div className="info-card">
                    <h3>Technical Status</h3>
                    <div className="details-list">
                        <div className="detail-item">
                            <div className="detail-label">Specialization</div>
                            <div className="detail-value">General Maintenance</div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-label">Next Shift</div>
                            <div className="detail-value">Tomorrow 08:00 AM</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
