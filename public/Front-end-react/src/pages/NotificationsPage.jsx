import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import './ViewAllPages.css';

// Helper to get image URL
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${window.location.origin}/storage/${path}`;
};

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchItems = async (pageNum = 1, append = false) => {
        try {
            const data = await userService.getNotifications(pageNum);
            const mapped = (data.notifications?.data || []).map((n) => ({
                id: n.id,
                title: n.data?.title || 'إشعار',
                time: n.data?.time || '',
                image: n.data?.image,
                link: n.data?.link,
                read: !!n.read_at,
                type: n.data?.type || 'general',
                duration: n.data?.duration,
                reply_content: n.data?.reply_content,
                original_comment: n.data?.original_comment,
                comment_content: n.data?.comment_content,
                is_like: n.data?.is_like,
            }));

            if (append) {
                setNotifications(prev => [...prev, ...mapped]);
            } else {
                setNotifications(mapped);
            }
            setHasMore(data.notifications?.current_page < data.notifications?.last_page);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
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

    const markAllRead = async () => {
        try {
            await userService.markNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getNotificationIcon = (notif) => {
        switch (notif.type) {
            case 'reply': return '💬';
            case 'like': return notif.is_like ? '❤️' : '👎';
            case 'episode': return '▶️';
            default: return '🔔';
        }
    };

    // Navigate to episode when notification clicked
    const navigate = useNavigate();
    const handleNotificationClick = (notif) => {
        if (notif.link) {
            // Extract episode ID from link (e.g., /Front-end-react/dist/index.html#/episodes/123 or /ar/episodes/123)
            const match = notif.link.match(/episodes\/(\d+)/);
            if (match) {
                navigate(`/episodes/${match[1]}`);
            } else {
                // Fallback for old links
                window.location.href = notif.link;
            }
        }
    };

    return (
        <div className="view-all-page">
            <div className="page-header">
                <Link to="/" className="back-btn">← الرجوع</Link>
                <h1>🔔 الإشعارات</h1>
                <button onClick={markAllRead} className="mark-read-btn">
                    تحديد الكل كمقروء
                </button>
            </div>

            {loading ? (
                <div className="page-loading">
                    <span className="spinner"></span>
                    <span>جاري التحميل...</span>
                </div>
            ) : notifications.length === 0 ? (
                <div className="page-empty">
                    <span className="empty-icon">🔔</span>
                    <h2>لا توجد إشعارات</h2>
                    <p>ستظهر هنا الإشعارات الجديدة</p>
                    <Link to="/" className="browse-btn">الرجوع للرئيسية</Link>
                </div>
            ) : (
                <>
                    <div className="notifications-list">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`notification-card ${!notif.read ? 'unread' : ''} ${notif.link ? 'clickable' : ''}`}
                                onClick={() => handleNotificationClick(notif)}
                            >
                                {/* Image/Icon */}
                                <div className="notif-avatar">
                                    {notif.type === 'episode' && notif.image ? (
                                        <div className="episode-thumb-lg">
                                            <img src={getImageUrl(notif.image)} alt="" />
                                            {notif.duration && (
                                                <span className="duration">{notif.duration} د</span>
                                            )}
                                        </div>
                                    ) : notif.image ? (
                                        <img
                                            src={getImageUrl(notif.image)}
                                            alt=""
                                            className="user-img"
                                        />
                                    ) : (
                                        <span className="notif-icon">{getNotificationIcon(notif)}</span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="notif-body">
                                    <h3 className="notif-title">{notif.title}</h3>

                                    {notif.type === 'reply' && notif.reply_content && (
                                        <div className="notif-details">
                                            <p className="reply-text">"{notif.reply_content}"</p>
                                            {notif.original_comment && (
                                                <p className="original-text">
                                                    <span>تعليقك:</span> {notif.original_comment}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {notif.type === 'like' && notif.comment_content && (
                                        <div className="notif-details">
                                            <p className="reply-text">"{notif.comment_content}"</p>
                                        </div>
                                    )}

                                    <span className="notif-time">{notif.time}</span>
                                </div>

                                {!notif.read && <span className="unread-indicator"></span>}
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

export default NotificationsPage;
