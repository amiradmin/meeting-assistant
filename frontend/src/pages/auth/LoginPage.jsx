import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // If already logged in, redirect to dashboard
            navigate('/');
        }
    }, [navigate]);

    // Load saved username if "Remember me" was checked previously
    useEffect(() => {
        const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
        const savedUsername = localStorage.getItem('savedUsername');

        if (savedRememberMe && savedUsername) {
            setRememberMe(true);
            setUsername(savedUsername);
        }
    }, []);

    // Generate floating particles
    useEffect(() => {
        const createParticles = () => {
            const wrapper = document.querySelector('.login-wrapper');
            if (!wrapper) return;

            const existingParticles = wrapper.querySelectorAll('.particle');
            existingParticles.forEach(p => p.remove());

            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                const size = Math.random() * 3 + 1;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
                particle.style.animationDelay = `${Math.random() * 5}s`;
                wrapper.appendChild(particle);
            }
        };

        createParticles();

        return () => {
            const wrapper = document.querySelector('.login-wrapper');
            if (wrapper) {
                const particles = wrapper.querySelectorAll('.particle');
                particles.forEach(p => p.remove());
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('لطفاً نام کاربری و رمز عبور را وارد کنید');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            // Connect to the working backend endpoint
            const response = await fetch('http://localhost:8000/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Successful login
                const { access, refresh, user } = data;

                // Store tokens
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
                localStorage.setItem('user', JSON.stringify(user));

                // Handle "Remember Me"
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('savedUsername', username.trim());
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('savedUsername');
                }

                // Redirect to dashboard
                navigate('/');
            } else {
                // Handle errors
                if (data.detail) {
                    setError(data.detail);
                } else if (data.error) {
                    setError(data.error);
                } else {
                    setError('نام کاربری یا رمز عبور اشتباه است');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('خطا در ارتباط با سرور. لطفاً مجدداً تلاش کنید.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        alert('لطفاً با پشتیبانی سیستم تماس بگیرید: ۰۲۱-XXXX-XXXX');
    };

    // EAF SVG Icon Component
    const EAFIcon = () => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="rgba(255,255,255,0.2)"
            />
            <path
                d="M2 17L12 22L22 17"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M2 12L12 17L22 12"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <circle cx="12" cy="12" r="2" fill="#00d4ff" stroke="none"/>
        </svg>
    );

    const currentYear = new Date().getFullYear();

    return (
        <div className="login-wrapper">
            <div className="glow-orb-1"></div>
            <div className="glow-orb-2"></div>

            <div className="login-container">
                <div className="login-card">
                    <div className="logo-area">
                        <div className="logo-icon">
                            <img
                                src="/images/mianeh_logo (1).png"
                                alt="مجتمع فولاد میانه"
                                className="company-logo1"
                                style={{
                                    width: '300px',
                                    height: '180px',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                        <br />
                        <div className="subtitle">سیستم کنترل سطح ۲</div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-message">{error}</div>}

                        <div className="input-group">
                            <label className="input-label">نام کاربری</label>
                            <input
                                type="text"
                                className="input-field"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="نام کاربری / شناسه پرسنلی"
                                required
                                autoComplete="username"
                                disabled={isLoading}
                                dir="ltr"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">رمز عبور</label>
                            <input
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                disabled={isLoading}
                                dir="ltr"
                            />
                        </div>

                        <div className="options-row">
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                />
                                مرا به خاطر بسپار
                            </label>
                            <button
                                type="button"
                                className="forgot-link"
                                onClick={handleForgotPassword}
                                disabled={isLoading}
                            >
                                فراموشی رمز عبور؟
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    در حال ورود...
                                </>
                            ) : (
                                'ورود به سامانه'
                            )}
                        </button>

                        <div className="system-info">
                            <span>سامانه نظارت و بهینه‌سازی ذوب</span>
                            <br />
                            <span className="version-badge">
                                PCS Release 6.0 | EAF Optimizer
                            </span>
                        </div>

                        <div className="copyright">
                            <div className="developer-line">
                                <span className="company-name">MITE Co</span>
                                <span className="separator-dot">•</span>
                                <span>شرکت مهندسی فن آور صنعت مدائن</span>
                            </div>
                            <div className="rights-line">
                                © {currentYear} | تمامی حقوق محفوظ است
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;