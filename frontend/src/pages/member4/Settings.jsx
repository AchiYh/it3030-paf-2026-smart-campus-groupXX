import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

export default function Settings() {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('account');
    const [theme, setTheme] = useState('light');

    return (
        <div className='settings-content-only'>
            <div className='settings-header'>
                <h1>System Settings</h1>
                <p>Configure your institutional portal preferences and security protocols.</p>
            </div>

            <nav className='settings-tabs'>
                <button className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>Account</button>
                <button className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`} onClick={() => setActiveTab('appearance')}>Appearance</button>
                <button className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
            </nav>

            <div className='settings-section'>
                {activeTab === 'account' && (
                    <>
                        <div className='setting-row'>
                            <div className='setting-info'>
                                <h4>Authentication Protocol</h4>
                                <p>Manage your password and security credentials.</p>
                            </div>
                            <button className='btn-update'>UPDATE PASSWORD</button>
                        </div>
                        <div className='setting-row'>
                            <div className='setting-info'>
                                <h4>Multi-Factor Auth</h4>
                                <p>Enable extra layer of security for login attempts.</p>
                            </div>
                            <div className='toggle-switch' />
                        </div>
                    </>
                )}
                {activeTab === 'appearance' && (
                    <>
                        <div className='setting-row'>
                            <div className='setting-info'>
                                <h4>Interface Theme</h4>
                                <p>Select the visual profile for your dashboard.</p>
                            </div>
                            <div className='setting-action'>
                                <select value={theme} onChange={e => setTheme(e.target.value)}>
                                    <option value='light'>Light Institutional</option>
                                    <option value='dark'>Dark Command</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}
                {activeTab === 'notifications' && (
                    <>
                        <div className='setting-row'>
                            <div className='setting-info'>
                                <h4>Email Alerts</h4>
                                <p>Receive status updates regarding your tickets and bookings.</p>
                            </div>
                            <div className='toggle-switch active' />
                        </div>
                        <div className='setting-row'>
                            <div className='setting-info'>
                                <h4>Security Notifications</h4>
                                <p>Get notified about new login attempts from unknown devices.</p>
                            </div>
                            <div className='toggle-switch active' />
                        </div>
                    </>
                )}
            </div>

            <div style={{marginTop: '40px'}}>
                <button className='logout-btn' style={{color: '#ef4444', border: '1px solid #fee2e2', background: '#fef2f2'}} onClick={logout}>
                    TERMINATE SESSION (LOGOUT)
                </button>
            </div>
        </div>
    );
}
