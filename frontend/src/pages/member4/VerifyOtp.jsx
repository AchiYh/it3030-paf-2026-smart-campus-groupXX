import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';
import './VerifyOtp.css';

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const otpFromUrl = searchParams.get('code') || '';
    const emailHint = searchParams.get('email') || location.state?.email || '';

    const [otp, setOtp] = useState(otpFromUrl);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleVerify = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!otp.trim()) {
            setError('OTP is required.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/verify-code', {
                verifyCode: otp.trim(),
            });

            if (!response.data?.success) {
                setError(response.data?.message || 'Verification failed.');
                return;
            }

            // Email stored in backend cookie, no localStorage cleanup needed
            setSuccess('Account verified successfully.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setSuccess('');
        setResending(true);

        try {
            const response = await api.post('/auth/resend-otp');

            if (!response.data?.success) {
                setError(response.data?.message || 'Failed to resend OTP.');
                return;
            }

            setSuccess(response.data?.message || 'OTP resent.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className='verify-page'>
            <div className='verify-page__canvas' />

            <div className='verify-layout'>
                <section className='verify-showcase' aria-hidden='true'>
                    <div className='forgot-showcase__photo'>
                        <div className='forgot-showcase__top'>
                            <strong>Smart Campus Portal</strong>
                            <div className='forgot-showcase__actions'>
                                <span>Multi-Factor Authenticated</span>
                                <span className='join-pill'>Secure</span>
                            </div>
                        </div>

                        <div className='forgot-showcase__center'>
                            <h1>Identity Verification Hub</h1>
                            <p>Verify your institutional account using the security code sent to your email.</p>
                        </div>

                        <div className='forgot-showcase__bottom'>
                            <div className='forgot-showcase__profile'>
                                <span className='forgot-showcase__avatar'>SC</span>
                                <div>
                                    <p>Smart Campus Hub</p>
                                    <small>Account Security Portal</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className='verify-card-wrap'>
                    <div className='verify-card'>
                        <div className='verify-card__topbar'>
                            <strong className='verify-brand'>Verify Account</strong>
                        </div>

                        <div className='verify-card__header'>
                            <p>Enter the OTP sent to {emailHint || 'your institutional email'}.</p>
                        </div>

                        <div className='verify-steps' aria-label='Verification status'>
                            <span className='active'>1. Enter OTP</span>
                            <span>2. Access Ready</span>
                        </div>

                        {error && <div className='message error'>{error}</div>}
                        {success && <div className='message success'>{success}</div>}

                        <form className='verify-form' onSubmit={handleVerify} noValidate>
                            <label className='form-group'>
                                <span>Verification Code</span>
                                <input
                                    value={otp}
                                    onChange={(event) => setOtp(event.target.value)}
                                    placeholder='6-digit OTP'
                                    autoComplete='one-time-code'
                                    required
                                />
                            </label>

                            <button className='verify-btn verify-btn--primary' type='submit' disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </form>

                        <div className='verify-actions'>
                            <button
                                className='verify-btn verify-btn--secondary'
                                type='button'
                                onClick={handleResend}
                                disabled={resending}
                            >
                                {resending ? 'Resending...' : 'Resend OTP'}
                            </button>
                            <Link className='verify-btn verify-btn--ghost' to='/login'>
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            <footer className='verify-page__footer'>
                © {new Date().getFullYear()} SLIIT GLOBAL. All rights reserved.
            </footer>
        </div>
    );
}
