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

function WatchLaterPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchItems = async (pageNum = 1, append = false) => {
        try {
            const data = await userService.getWatchLater(pageNum);
            if (append) {
                setItems(prev => [...prev, ...(data.data || [])]);
            } else {
                setItems(data.data || []);
            }
            setHasMore(data.current_page < data.last_page);
        } catch (error) {
            console.error('Failed to fetch watch later:', error);
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

    const removeItem = async (episodeId) => {
        try {
            await userService.removeWatchLater(episodeId);
            setItems(prev => prev.filter(item => item.id !== episodeId));
        } catch (error) {
            console.error('Failed to remove:', error);
        }
    };

    return (
        <div className="view-all-page">
            <div className="page-header">
                <Link to="/" className="back-btn">← الرجوع</Link>
                <h1>🕐 المشاهدة لاحقاً</h1>
            </div>

            {loading ? (
                <div className="page-loading">
                    <span className="spinner"></span>
                    <span>جاري التحميل...</span>
                </div>
            ) : items.length === 0 ? (
                <div className="page-empty">
                    <span className="empty-icon">🕐</span>
                    <h2>القائمة فارغة</h2>
                    <p>لم تضف أي حلقات للمشاهدة لاحقاً</p>
                    <Link to="/" className="browse-btn">تصفح الحلقات</Link>
                </div>
            ) : (
                <>
                    <div className="items-grid">
                        {items.map((item) => (
                            <div key={item.id} className="item-card">
                                <div
                                    className="card-link"
                                    onClick={() => navigate(`/episodes/${item.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="card-thumb">
                                        <img src={getImageUrl(item.image)} alt={item.title} />
                                    </div>
                                    <div className="card-content">
                                        <h3 className="card-title">
                                            الحلقة {item.episode_number} - {item.title}
                                        </h3>
                                        <span className="card-series">{item.series_title}</span>
                                        <span className="card-time">أُضيف {item.added_at}</span>
                                    </div>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeItem(item.id);
                                    }}
                                >
                                    ✕ إزالة
                                </button>
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

export default WatchLaterPage;
