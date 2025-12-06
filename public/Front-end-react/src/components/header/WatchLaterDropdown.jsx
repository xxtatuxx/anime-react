import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';
import './dropdown.css';

// Helper to get image URL - handles /storage/ prefix correctly
const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/96x56';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage/')) return `${window.location.origin}${path}`;
    if (path.startsWith('/')) return `${window.location.origin}${path}`;
    return `${window.location.origin}/storage/${path}`;
};

function WatchLaterDropdown() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
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

    const fetchWatchLater = async () => {
        setLoading(true);
        try {
            const data = await userService.getWatchLater();
            setItems(data.data || []);
        } catch (error) {
            console.error('Failed to fetch watch later:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchWatchLater();
        }
    };

    const handleItemClick = (episodeId) => {
        setIsOpen(false);
        navigate(`/episodes/${episodeId}`);
    };

    const removeItem = async (episodeId, e) => {
        e.stopPropagation();
        try {
            await userService.removeWatchLater(episodeId);
            setItems(prev => prev.filter(item => item.id !== episodeId));
        } catch (error) {
            console.error('Failed to remove:', error);
        }
    };

    return (
        <div className="dropdown-container" ref={dropdownRef}>
            <button className="dropdown-trigger" onClick={handleOpen}>
                🕐
            </button>

            {isOpen && (
                <div className="dropdown-content watchlater-dropdown">
                    <div className="dropdown-header">
                        <h3>المشاهدة لاحقاً</h3>
                        <a href="#/watch-later" className="view-all-link" onClick={() => setIsOpen(false)}>
                            عرض الكل
                        </a>
                    </div>

                    <div className="dropdown-list">
                        {loading ? (
                            <div className="dropdown-loading">
                                <span className="spinner"></span>
                                <span>جاري التحميل...</span>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="dropdown-empty">
                                <span>🕐</span>
                                <span>القائمة فارغة</span>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    className="watchlater-item"
                                    onClick={() => handleItemClick(item.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="watchlater-thumb">
                                        <img src={getImageUrl(item.image)} alt={item.title} />
                                    </div>
                                    <div className="watchlater-content">
                                        <p className="watchlater-title">
                                            الحلقة {item.episode_number} - {item.title}
                                        </p>
                                        <span className="watchlater-series">{item.series_title}</span>
                                        {item.added_at && (
                                            <span className="watchlater-time">أُضيف {item.added_at}</span>
                                        )}
                                    </div>
                                    <button
                                        className="remove-btn"
                                        onClick={(e) => removeItem(item.id, e)}
                                        title="إزالة"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WatchLaterDropdown;
