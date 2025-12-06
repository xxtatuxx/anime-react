import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';
import './dropdown.css';

// Helper to get image URL - handles /storage/ prefix correctly
const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/96x64';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage/')) return `${window.location.origin}${path}`;
    if (path.startsWith('/')) return `${window.location.origin}${path}`;
    return `${window.location.origin}/storage/${path}`;
};

// Action descriptions based on type
const getActionDescription = (item) => {
    const episodeInfo = `الحلقة ${item.episode_number}`;
    switch (item.type) {
        case 'comment':
            return `علّقت: "${item.metadata?.content || '...'}"`;
        case 'reply':
            return `رددت على ${item.metadata?.replied_to_user || 'مستخدم'}: "${item.metadata?.content || '...'}"`;
        case 'like':
            return `أعجبت بتعليق ${item.metadata?.comment_owner || 'مستخدم'}: "${item.metadata?.comment_content || '...'}"`;
        default:
            return `شاهدت ${episodeInfo}`;
    }
};

// Get icon based on type
const getActionIcon = (type) => {
    switch (type) {
        case 'comment': return '💬';
        case 'reply': return '↩️';
        case 'like': return '❤️';
        default: return '▶️';
    }
};

// Get color class based on type
const getActionColor = (type) => {
    switch (type) {
        case 'comment': return 'color-blue';
        case 'reply': return 'color-green';
        case 'like': return 'color-red';
        default: return 'color-indigo';
    }
};

function HistoryDropdown() {
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

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await userService.getHistory();
            setItems(data.data || []);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchHistory();
        }
    };

    const handleItemClick = (episodeId) => {
        setIsOpen(false);
        navigate(`/episodes/${episodeId}`);
    };

    return (
        <div className="dropdown-container" ref={dropdownRef}>
            <button className="dropdown-trigger" onClick={handleOpen}>
                📜
            </button>

            {isOpen && (
                <div className="dropdown-content history-dropdown">
                    <div className="dropdown-header">
                        <h3>سجل النشاط</h3>
                        <a href="#/history" className="view-all-link" onClick={() => setIsOpen(false)}>
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
                                <span>📜</span>
                                <span>لم تقم بأي نشاط مؤخراً</span>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    className="history-item"
                                    onClick={() => handleItemClick(item.episode_id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="history-thumb">
                                        <img src={getImageUrl(item.image)} alt={item.series_title} />
                                        <div className="thumb-overlay">
                                            <span className={getActionColor(item.type)}>
                                                {getActionIcon(item.type)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="history-content">
                                        <div className="history-title-row">
                                            <span className={`action-icon ${getActionColor(item.type)}`}>
                                                {getActionIcon(item.type)}
                                            </span>
                                            <span className="history-series">{item.series_title}</span>
                                        </div>
                                        <p className="history-description">
                                            {getActionDescription(item)}
                                        </p>
                                        <div className="history-meta">
                                            <span>الحلقة {item.episode_number}</span>
                                            <span>{item.created_at}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default HistoryDropdown;
