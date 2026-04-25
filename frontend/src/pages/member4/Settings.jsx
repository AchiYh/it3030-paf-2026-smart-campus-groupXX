import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

export default function Settings() {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();
    
    const [now, setNow] = useState(() => new Date());
    const [activeTab, setActiveTab] = useState('account');
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const roleLabel = user?.role || 'USER';
    let roleHomePath = '/dashboard';
    if (roleLabel === 'ADMIN') roleHomePath = '/admin-dashboard';
    else if (roleLabel === 'TECHNICIAN') roleHomePath = '/tech-dashboard';
    else roleHomePath = '/user-dashboard';

    const fullName = user?.fullName || user?.email?.split('@')[0] || "User";
    const initials = fullName[0]?.toUpperCase() || "U";
    
    const calendarYear = now.getFullYear();
    const calendarMonth = now.getMonth();
    const calendarLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const clockLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const calendarFirstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const calendarDaysCount = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const calendarCells = [
        ...Array.from({ length: calendarFirstDay }, () => null),
        ...Array.from({ length: calendarDaysCount }, (_, index) => index + 1),
    ];

    return (
        <div className='settings-page'>
            <div className='settings-page__canvas' />

            <div className='settings-workbench'>
                <aside className='settings-sidebar'>
                    <div className='sidebar-brand'>
                        <span className='brand-avatar' style={{ background: "linear-gradient(130deg, #ed7b3f, #ffc292)", color: "#fff" }}>
                            {initials}
                        </span>
                        <div className='brand-info'>
                            <strong>{fullName}</strong>
                            <small>{user?.email || 'No email'}</small>
                        </div>
                    </div>

                    <nav className='sidebar-nav'>
                        <p className='sidebar-label'>Quick Navigation</p>
                        <Link className='sidebar-link' to={roleHomePath}>
                            Home
                        </Link>
                        <Link className='sidebar-link' to='/profile'>
                            Profile
                        </Link>
                        <Link className='sidebar-link active' to='/settings'>
                            Settings
                        </Link>
                    </nav>

                    <div className='sidebar-calendar-card'>
                        <p className='sidebar-label'>Calendar</p>
                        <div className='sidebar-calendar-header'>
                            <strong>{calendarLabel}</strong>
                            <span className='sidebar-today-badge'>Today {now.getDate()}</span>
                        </div>
                        <div className='sidebar-clock'>{clockLabel}</div>
                        <div className='sidebar-calendar-grid'>
                            <div className='sidebar-calendar-weekdays'>
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                    <span key={day} className='weekday'>{day}</span>
                                ))}
                            </div>
                            <div className='sidebar-calendar-days'>
                                {calendarCells.map((day, index) => (
                                    <span
                                        key={`day-${index}`}
                                        className={`day${day === null ? ' empty' : ''}${day === now.getDate() ? ' today' : ''}`}
                                        aria-hidden={day === null}
                                    >
                                        {day ?? ''}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <main className='settings-main'>
                    <header className='settings-header'>
                        <div className='settings-header__title'>
                            <h1>Settings</h1>
                            <p>Manage your application preferences and security settings.</p>
                        </div>
                        <div className='settings-header__actions'>
                            <button className='btn btn-danger' type='button' onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </header>

                    <div className='settings-container'>
                        <nav className='settings-tabs'>
                            <button 
                                className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
                                onClick={() => setActiveTab('account')}
                            >
                                Account
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
                                onClick={() => setActiveTab('appearance')}
                            >
                                Appearance
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notifications')}
                            >
                                Notifications
                            </button>
                        </nav>

                        <div className='settings-content'>
                            {activeTab === 'account' && (
                                <div className='settings-section'>
                                    <h2>Account Settings</h2>
                                    <p className='section-desc'>Update your security and account preferences here.</p>
                                    
                                    <div className='setting-item'>
                                        <div className='setting-info'>
                                            <strong>Change Password</strong>
                                            <p>Update your password to keep your account secure.</p>
                                        </div>
                                        <button className='btn btn-secondary' onClick={() => alert('Feature coming soon!')}>Update</button>
                                    </div>
                                    <div className='setting-item'>
                                        <div className='setting-info'>
                                            <strong>Two-Factor Authentication</strong>
                                            <p>Add an extra layer of security to your account.</p>
                                        </div>
                                        <button className='btn btn-secondary' onClick={() => alert('Feature coming soon!')}>Enable</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'appearance' && (
                                <div className='settings-section'>
                                    <h2>Appearance Settings</h2>
                                    <p className='section-desc'>Customize how the application looks for you.</p>
                                    
                                    <div className='setting-item'>
                                        <div className='setting-info'>
                                            <strong>Theme</strong>
                                            <p>Select your preferred color theme.</p>
                                        </div>
                                        <select 
                                            value={theme} 
                                            onChange={(e) => setTheme(e.target.value)}
                                            className='settings-select'
                                        >
                                            <option value='dark'>Dark Theme</option>
                                            <option value='light'>Light Theme</option>
                                            <option value='system'>System Default</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className='settings-section'>
                                    <h2>Notification Preferences</h2>
                                    <p className='section-desc'>Control how you receive alerts and updates.</p>
                                    
                                    <div className='setting-item'>
                                        <div className='setting-info'>
                                            <strong>Email Notifications</strong>
                                            <p>Receive updates about your tickets and bookings via email.</p>
                                        </div>
                                        <div className='toggle-switch active' onClick={(e) => e.currentTarget.classList.toggle('active')} />
                                    </div>
                                    <div className='setting-item'>
                                        <div className='setting-info'>
                                            <strong>In-App Alerts</strong>
                                            <p>Show push notifications while you are using the app.</p>
                                        </div>
                                        <div className='toggle-switch active' onClick={(e) => e.currentTarget.classList.toggle('active')} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
