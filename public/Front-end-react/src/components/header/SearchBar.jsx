import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './SearchBar.css';

// Helper to get image URL
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${window.location.origin}/storage/${path}`;
};

function SearchBar({ isOpen, setIsOpen }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ animes: [], episodes: [] });
    const [searching, setSearching] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when mobile search opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Debounced search
    const debounceRef = useRef(null);

    const handleSearch = useCallback((value) => {
        setQuery(value);

        if (value.length < 1) {
            setDropdownOpen(false);
            setResults({ animes: [], episodes: [] });
            return;
        }

        // Debounce search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            setDropdownOpen(true);

            try {
                const response = await api.get('/search', { params: { q: value } });
                setResults(response.data.searchResults || { animes: [], episodes: [] });
            } catch (error) {
                console.error('Search error:', error);
                setResults({ animes: [], episodes: [] });
            } finally {
                setSearching(false);
            }
        }, 300);
    }, []);

    const handleClose = () => {
        setQuery('');
        setDropdownOpen(false);
        setIsOpen(false);
    };

    const handleResultClick = () => {
        setDropdownOpen(false);
        setQuery('');
        if (isOpen) setIsOpen(false);
    };

    const hasResults = results.animes.length > 0 || results.episodes.length > 0;

    return (
        <div className="search-wrapper" ref={wrapperRef}>
            {/* Mobile Search Button */}
            <button
                className="mobile-search-btn"
                onClick={() => setIsOpen(true)}
            >
                🔍
            </button>

            {/* Desktop Search */}
            <div className="desktop-search-container">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="بحث..."
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => query.length > 0 && setDropdownOpen(true)}
                    />
                </div>

                {/* Dropdown Results */}
                {dropdownOpen && (
                    <div className="search-dropdown">
                        {searching ? (
                            <div className="search-loading">
                                <span className="spinner"></span>
                            </div>
                        ) : (
                            <>
                                {results.animes.length > 0 && (
                                    <div className="search-section">
                                        <h4 className="section-title">أنميات</h4>
                                        {results.animes.map((anime) => (
                                            <Link
                                                key={anime.id}
                                                to={`/anime/${anime.id}`}
                                                className="search-item"
                                                onClick={handleResultClick}
                                            >
                                                {anime.image && (
                                                    <img
                                                        src={getImageUrl(anime.image)}
                                                        alt={anime.title}
                                                        className="search-item-img"
                                                    />
                                                )}
                                                <span className="search-item-title">{anime.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {results.episodes.length > 0 && (
                                    <div className="search-section">
                                        <h4 className="section-title">حلقات</h4>
                                        {results.episodes.map((ep) => (
                                            <Link
                                                key={ep.id}
                                                to={`/episodes/${ep.id}`}
                                                className="search-item"
                                                onClick={handleResultClick}
                                            >
                                                {ep.thumbnail && (
                                                    <img
                                                        src={getImageUrl(ep.thumbnail)}
                                                        alt={ep.title}
                                                        className="search-item-img"
                                                    />
                                                )}
                                                <div className="search-item-info">
                                                    <span className="search-item-title">{ep.title}</span>
                                                    <span className="search-item-sub">حلقة {ep.episode_number}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {!hasResults && !searching && query.length > 0 && (
                                    <div className="search-empty">
                                        لا توجد نتائج مطابقة
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Expanded Search */}
            {isOpen && (
                <div className="mobile-search-overlay">
                    <div className="mobile-search-header">
                        <div className="mobile-search-input-wrapper">
                            <span className="search-icon">🔍</span>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="بحث عن أنمي أو حلقة..."
                                value={query}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <button className="close-search" onClick={handleClose}>
                            ✕
                        </button>
                    </div>

                    {/* Mobile Dropdown Results */}
                    <div className="mobile-search-results">
                        {searching ? (
                            <div className="search-loading">
                                <span className="spinner"></span>
                            </div>
                        ) : (
                            <>
                                {results.animes.length > 0 && (
                                    <div className="search-section">
                                        <h4 className="section-title">أنميات</h4>
                                        {results.animes.map((anime) => (
                                            <Link
                                                key={anime.id}
                                                to={`/anime/${anime.id}`}
                                                className="search-item"
                                                onClick={handleResultClick}
                                            >
                                                {anime.image && (
                                                    <img
                                                        src={getImageUrl(anime.image)}
                                                        alt={anime.title}
                                                        className="search-item-img"
                                                    />
                                                )}
                                                <span className="search-item-title">{anime.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {results.episodes.length > 0 && (
                                    <div className="search-section">
                                        <h4 className="section-title">حلقات</h4>
                                        {results.episodes.map((ep) => (
                                            <Link
                                                key={ep.id}
                                                to={`/episodes/${ep.id}`}
                                                className="search-item"
                                                onClick={handleResultClick}
                                            >
                                                {ep.thumbnail && (
                                                    <img
                                                        src={getImageUrl(ep.thumbnail)}
                                                        alt={ep.title}
                                                        className="search-item-img"
                                                    />
                                                )}
                                                <div className="search-item-info">
                                                    <span className="search-item-title">{ep.title}</span>
                                                    <span className="search-item-sub">حلقة {ep.episode_number}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {!hasResults && !searching && query.length > 0 && (
                                    <div className="search-empty">
                                        لا توجد نتائج مطابقة
                                    </div>
                                )}

                                {query.length === 0 && (
                                    <div className="search-hint">
                                        اكتب للبحث عن أنمي أو حلقة
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchBar;
