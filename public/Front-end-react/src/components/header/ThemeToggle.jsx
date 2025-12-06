import { useState, useEffect } from 'react';
import './ThemeToggle.css';

function ThemeToggle() {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Check saved theme or default to dark
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDark(false);
            document.documentElement.classList.add('light-theme');
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (isDark) {
            document.documentElement.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        }
    };

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    );
}

export default ThemeToggle;
