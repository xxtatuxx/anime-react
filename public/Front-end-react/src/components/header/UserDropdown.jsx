import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './dropdown.css';

function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    return (
        <div className="dropdown-container" ref={dropdownRef}>
            <button
                className="dropdown-trigger user-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isAuthenticated && user ? (
                    <span className="user-avatar">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                ) : (
                    <span className="guest-icon">👤</span>
                )}
            </button>

            {isOpen && (
                <div className="dropdown-content user-dropdown">
                    {isAuthenticated && user ? (
                        <>
                            <div className="user-info-header">
                                <div className="user-avatar-large">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{user.name}</span>
                                    <span className="user-email">{user.email}</span>
                                </div>
                            </div>

                            <div className="dropdown-divider"></div>

                            <button className="dropdown-action logout" onClick={handleLogout}>
                                🚪 تسجيل الخروج
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="guest-header">
                                <span className="guest-icon-large">👤</span>
                                <span>مرحباً بك!</span>
                            </div>

                            <div className="auth-buttons">
                                <Link to="/login" className="auth-btn login" onClick={() => setIsOpen(false)}>
                                    تسجيل الدخول
                                </Link>
                                <Link to="/register" className="auth-btn register" onClick={() => setIsOpen(false)}>
                                    إنشاء حساب
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default UserDropdown;
