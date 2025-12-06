import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import './ViewAllPages.css';

// Helper to get image URL
const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/120x80';
    if (path.startsWith('http')) return path;
    return `${window.location.origin}/storage/${path}`;
};

// Action descriptions
const getActionDescription = (item) => {
    switch (item.type) {
        case 'comment':
            return `علّقت: "${item.metadata?.content || '...'}"`;
        case 'reply':
            return `رددت على ${item.metadata?.replied_to_user || 'مستخدم'}: "${item.metadata?.content || '...'}"`;
        case 'like':
            return `أعجبت بتعليق ${item.metadata?.comment_owner || 'مستخدم'}: "${item.metadata?.comment_content || '...'}"`;
        default:
            return `شاهدت الحلقة ${item.episode_number}`;
    }
};

const getActionIcon = (type) => {
    switch (type) {
        case 'comment': return '💬';
        case 'reply': return '↩️';
        case 'like': return '❤️';
        default: return '▶️';
    }
};

const getActionColor = (type) => {
    switch (type) {
        case 'comment': return 'color-blue';
        case 'reply': return 'color-green';
        case 'like': return 'color-red';
        default: return 'color-indigo';
    }
};

function HistoryPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchItems = async (pageNum = 1, append = false) => {
        try {
            const data = await userService.getHistory(pageNum);
            if (append) {
                setItems(prev => [...prev, ...(data.data || [])]);
            } else {
                setItems(data.data || []);
            }
            setHasMore(data.current_page < data.last_page);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchItems(nextPage, true);
    };

    return (
        <div className="view-all-page">
            <div className="page-header">
                <Link to="/" className="back-btn">← الرجوع</Link>
                <h1>📜 سجل النشاط</h1>
            </div>

            {loading ? (
                <div className="page-loading">
                    <span className="spinner"></span>
                    <span>جاري التحميل...</span>
                </div>
            ) : items.length === 0 ? (
                <div className="page-empty">
                    <span className="empty-icon">📜</span>
                    <h2>لا يوجد نشاط</h2>
                    <p>لم تقم بأي نشاط مؤخراً</p>
                    <Link to="/" className="browse-btn">تصفح الحلقات</Link>
                </div>
            ) : (
                <>
                    <div className="items-list">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="history-card clickable"
                                onClick={() => navigate(`/episodes/${item.episode_id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="card-thumb">
                                    <img src={getImageUrl(item.image)} alt={item.series_title} />
                                    <span className={`action-badge ${getActionColor(item.type)}`}>
                                        {getActionIcon(item.type)}
                                    </span>
                                </div>
                                <div className="card-content">
                                    <div className="card-header-row">
                                        <span className={`action-icon ${getActionColor(item.type)}`}>
                                            {getActionIcon(item.type)}
                                        </span>
                                        <h3 className="card-title">{item.series_title}</h3>
                                    </div>
                                    <p className="card-description">{getActionDescription(item)}</p>
                                    <div className="card-meta">
                                        <span>الحلقة {item.episode_number}</span>
                                        <span>{item.created_at}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <button className="load-more-btn" onClick={loadMore}>
                            تحميل المزيد
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

export default HistoryPage;
