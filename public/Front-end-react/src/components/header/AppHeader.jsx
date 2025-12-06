import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import NotificationsDropdown from './NotificationsDropdown';
import WatchLaterDropdown from './WatchLaterDropdown';
import HistoryDropdown from './HistoryDropdown';
import UserDropdown from './UserDropdown';
import './AppHeader.css';

function AppHeader() {
    const { isAuthenticated, user } = useAuth();
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { title: 'الرئيسية', href: '/', icon: '🏠' },
        { title: 'قائمة الأنمي', href: '/anime', icon: '📺' },
        { title: 'الأفلام', href: '/movies', icon: '🎬' },
        { title: 'الحلقات', href: '/episodes', icon: '▶️' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="app-header">
            <div className="header-container">
                {/* Mobile Menu */}
                <MobileMenu navItems={navItems} isActive={isActive} />

                {/* Logo */}
                <Link to="/" className="header-logo">
                    <span className="logo-icon">🎌</span>
                    <span className="logo-text">أنمي لاست</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="desktop-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-title">{item.title}</span>
                        </Link>
                    ))}
                </nav>

                {/* Right Side Actions */}
                <div className="header-actions">
                    {/* Search */}
                    <SearchBar
                        isOpen={isMobileSearchOpen}
                        setIsOpen={setIsMobileSearchOpen}
                    />

                    {/* Icons (Hidden when mobile search is open) */}
                    {!isMobileSearchOpen && (
                        <div className="action-icons">
                            <ThemeToggle />

                            {isAuthenticated && (
                                <>
                                    <WatchLaterDropdown />
                                    <HistoryDropdown />
                                    <NotificationsDropdown />
                                </>
                            )}

                            <UserDropdown />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default AppHeader;
