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
                const { access, refresh } = data;

                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);

                // Get user info
                try {
                    const userResponse = await fetch('http://localhost:8000/api/user/', {
                        headers: {
                            'Authorization': `Bearer ${access}`,
                            'Accept': 'application/json',
                        },
                    });
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                } catch (err) {
                    console.error('Error fetching user info:', err);
                }

                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('savedUsername', username.trim());
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('savedUsername');
                }

                navigate('/');
            } else {
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
        alert('لطفاً با مدیر سیستم تماس بگیرید');
    };

    const currentYear = new Date().getFullYear();

    return (
        <div className="login-wrapper" dir="rtl">
            <div className="glow-orb-1"></div>
            <div className="glow-orb-2"></div>

            <div className="login-container">
                <div className="login-card">
                    <div className="logo-area">
                        <div className="logo-icon">
                            <div className="meeting-logo">
                                          <img
            style={{
              maxWidth: "210px",
              height: "auto"
            }}
            src="/images/logo_111.png"
            alt="MITE Logo"
          />
                            </div>
                        </div>
                      
                        <div className="subtitle">سیستم هوشمند تبدیل صدا به صورت جلسه</div>
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
                                placeholder="نام کاربری خود را وارد کنید"
                                required
                                autoComplete="username"
                                disabled={isLoading}
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
                                <span>مرا به خاطر بسپار</span>
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
                            <span>سیستم تبدیل خودکار جلسات به صورت جلسه</span>
                            <br />
                            <span className="version-badge">
                                Meeting Assistant v1.0 | مبتنی بر هوش مصنوعی
                            </span>
                        </div>

                        <div className="features">
                            <div className="feature-item">
                                <span>🎤</span>
                                <span>ضبط هوشمند صدا</span>
                            </div>
                            <div className="feature-item">
                                <span>📝</span>
                                <span>تبدیل به متن</span>
                            </div>
                            <div className="feature-item">
                                <span>🤖</span>
                                <span>خلاصه‌سازی با AI</span>
                            </div>
                        </div>

                        <div className="copyright">
                            <div className="developer-line">
                                <span className="company-name">دستیار جلسات</span>
                                <span className="separator-dot">•</span>
                                <span>سیستم مدیریت هوشمند جلسات</span>
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