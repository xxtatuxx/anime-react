import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './MobileMenu.css';

function MobileMenu({ navItems, isActive }) {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    return (
        <>
            {/* Hamburger Button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setIsOpen(true)}
                aria-label="القائمة"
            >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className="mobile-overlay" onClick={() => setIsOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span className="sidebar-logo">🎌 أنمي لاست</span>
                    <button
                        className="close-btn"
                        onClick={() => setIsOpen(false)}
                    >
                        ✕
                    </button>
                </div>

                {/* User Info */}
                {isAuthenticated && user && (
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="link-icon">{item.icon}</span>
                            <span>{item.title}</span>
                        </Link>
                    ))}
                </nav>

                {/* Auth Actions */}
                <div className="sidebar-footer">
                    {isAuthenticated ? (
                        <button className="logout-btn" onClick={handleLogout}>
                            🚪 تسجيل الخروج
                        </button>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" onClick={() => setIsOpen(false)}>
                                تسجيل الدخول
                            </Link>
                            <Link to="/register" onClick={() => setIsOpen(false)}>
                                إنشاء حساب
                            </Link>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}

export default MobileMenu;
