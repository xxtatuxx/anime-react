import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';
import './dropdown.css';

// Helper to get image URL - handles /storage/ prefix correctly
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage/')) return `${window.location.origin}${path}`;
    if (path.startsWith('/')) return `${window.location.origin}${path}`;
    return `${window.location.origin}/storage/${path}`;
};

// Icon components (emoji fallbacks)
const icons = {
    bell: '🔔',
    play: '▶️',
    reply: '💬',
    like: '❤️',
    dislike: '👎',
    trash: '🗑️',
};

function NotificationsDropdown() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
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

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await userService.getNotifications();
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
            setNotifications(mapped);
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchNotifications();
        }
    };

    const markAllRead = async () => {
        try {
            await userService.markNotificationsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getNotificationIcon = (notif) => {
        switch (notif.type) {
            case 'reply': return icons.reply;
            case 'like': return notif.is_like ? icons.like : icons.dislike;
            case 'episode': return icons.play;
            default: return icons.bell;
        }
    };

    const getIconClass = (notif) => {
        switch (notif.type) {
            case 'reply': return 'icon-blue';
            case 'like': return notif.is_like ? 'icon-red' : 'icon-gray';
            case 'episode': return 'icon-indigo';
            default: return 'icon-gray';
        }
    };

    const handleNotificationClick = (notif) => {
        if (notif.link) {
            setIsOpen(false);
            // Extract episode ID from link
            const match = notif.link.match(/episodes\/(\d+)/);
            if (match) {
                navigate(`/episodes/${match[1]}`);
            } else {
                window.location.href = notif.link;
            }
        }
    };

    return (
        <div className="dropdown-container" ref={dropdownRef}>
            <button className="dropdown-trigger" onClick={handleOpen}>
                🔔
                {unreadCount > 0 && (
                    <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="dropdown-content notifications-dropdown">
                    <div className="dropdown-header">
                        <h3>الإشعارات</h3>
                        <div className="header-actions">
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="mark-read-btn">
                                    تحديد كمقروء
                                </button>
                            )}
                            <a href="#/notifications" className="view-all-link" onClick={() => setIsOpen(false)}>
                                الكل
                            </a>
                        </div>
                    </div>

                    <div className="dropdown-list">
                        {loading ? (
                            <div className="dropdown-loading">
                                <span className="spinner"></span>
                                <span>جاري التحميل...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="dropdown-empty">
                                <span>🔔</span>
                                <span>لا توجد إشعارات</span>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                    style={{ cursor: notif.link ? 'pointer' : 'default' }}
                                >
                                    <div className="notif-media">
                                        {notif.type === 'episode' ? (
                                            <div className="episode-thumb">
                                                <img
                                                    src={getImageUrl(notif.image) || 'https://via.placeholder.com/96x64'}
                                                    alt=""
                                                />
                                                {notif.duration && (
                                                    <span className="duration-badge">{notif.duration} د</span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="user-avatar-wrapper">
                                                {notif.image ? (
                                                    <img
                                                        src={getImageUrl(notif.image)}
                                                        alt=""
                                                        className="user-avatar-img"
                                                    />
                                                ) : (
                                                    <div className={`user-avatar-icon ${getIconClass(notif)}`}>
                                                        {getNotificationIcon(notif)}
                                                    </div>
                                                )}
                                                <span className={`icon-badge ${getIconClass(notif)}`}>
                                                    {getNotificationIcon(notif)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="notif-content">
                                        <p className="notif-title">{notif.title}</p>

                                        {notif.type === 'reply' && notif.reply_content && (
                                            <div className="notif-details">
                                                <p className="reply-content">"{notif.reply_content}"</p>
                                                {notif.original_comment && (
                                                    <p className="original-comment">
                                                        <span className="label">تعليقك:</span> {notif.original_comment}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {notif.type === 'like' && notif.comment_content && (
                                            <div className="notif-details">
                                                <p className="reply-content">"{notif.comment_content}"</p>
                                            </div>
                                        )}

                                        <span className="notif-time">{notif.time}</span>
                                    </div>

                                    {!notif.read && <span className="unread-dot"></span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationsDropdown;
