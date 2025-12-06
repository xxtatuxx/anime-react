import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🎬</span>
                    <span className="brand-text">أنمي لاست</span>
                </Link>

                <div className="navbar-links">
                    <Link
                        to="/"
                        className={`nav-link ${isActive('/') ? 'active' : ''}`}
                    >
                        الرئيسية
                    </Link>
                    <Link
                        to="/anime"
                        className={`nav-link ${isActive('/anime') ? 'active' : ''}`}
                    >
                        الأنمي
                    </Link>
                    <Link
                        to="/movies"
                        className={`nav-link ${isActive('/movies') ? 'active' : ''}`}
                    >
                        الأفلام
                    </Link>
                    <Link
                        to="/episodes"
                        className={`nav-link ${isActive('/episodes') ? 'active' : ''}`}
                    >
                        الحلقات
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
