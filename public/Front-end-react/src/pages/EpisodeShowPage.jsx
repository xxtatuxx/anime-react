import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import CommentsSection from '../components/episode/CommentsSection';
import EpisodeOptionsMenu from '../components/episode/EpisodeOptionsMenu';
import './EpisodeShowPage.css';

// Helper to get image URL
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage/')) return `${window.location.origin}${path}`;
    return `${window.location.origin}/storage/${path}`;
};

function EpisodeShowPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [episode, setEpisode] = useState(null);
    const [series, setSeries] = useState(null);
    const [videos, setVideos] = useState([]);
    const [seriesEpisodes, setSeriesEpisodes] = useState([]);
    const [latestEpisodes, setLatestEpisodes] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentVideo, setCurrentVideo] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showServerModal, setShowServerModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [activeOptionsMenu, setActiveOptionsMenu] = useState(null);

    useEffect(() => {
        const fetchEpisode = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/react/episodes/${id}`);
                const data = response.data;
                setEpisode(data.episode);
                setSeries(data.series);
                setVideos(data.videos || []);
                setSeriesEpisodes(data.seriesEpisodes?.data || []);
                setLatestEpisodes(data.latestEpisodes || []);
                setComments(data.comments || []);

                // Set first video as current
                if (data.videos?.length > 0) {
                    setCurrentVideo(data.videos[0].video_url);
                }
            } catch (error) {
                console.error('Failed to fetch episode:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEpisode();
    }, [id]);

    // Close options menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveOptionsMenu(null);
        if (activeOptionsMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [activeOptionsMenu]);

    if (loading) {
        return (
            <div className="episode-show-loading">
                <span className="spinner"></span>
                <span>جاري التحميل...</span>
            </div>
        );
    }

    if (!episode) {
        return (
            <div className="episode-show-error">
                <h2>لم يتم العثور على الحلقة</h2>
                <Link to="/" className="back-btn">الرجوع للرئيسية</Link>
            </div>
        );
    }

    // Filter episodes by search
    const filteredEpisodes = seriesEpisodes.filter((ep) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            (ep.title && ep.title.toLowerCase().includes(query)) ||
            ep.episode_number?.toString().includes(query)
        );
    });

    // Share URL
    const shareUrl = window.location.href;

    // Toggle options menu for an episode
    const toggleOptionsMenu = (e, epId) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveOptionsMenu(activeOptionsMenu === epId ? null : epId);
    };

    return (
        <div className="episode-show-page" dir="rtl">
            <div className="episode-layout">
                {/* Main Content */}
                <div className="main-content">
                    {/* Video Player */}
                    <div className="video-player-container">
                        {currentVideo ? (
                            <iframe
                                src={currentVideo}
                                allowFullScreen
                                allow="autoplay; encrypted-media"
                                className="video-iframe"
                            ></iframe>
                        ) : (
                            <div className="no-video">
                                <span>📺</span>
                                <p>لا يتوفر فيديو حالياً</p>
                            </div>
                        )}
                    </div>

                    {/* Episode Details */}
                    <div className="episode-details">
                        <div className="episode-header">
                            <div className="episode-titles">
                                <h1>{episode.title || `الحلقة ${episode.episode_number}`}</h1>
                                {series && (
                                    <Link to={`/anime/${series.id}`} className="series-link">
                                        {series.title}
                                    </Link>
                                )}
                            </div>

                            <div className="episode-actions">
                                {videos.length > 1 && (
                                    <button className="action-btn" onClick={() => setShowServerModal(true)}>
                                        🖥️ تغيير السيرفر
                                    </button>
                                )}
                                <button className="action-btn" onClick={() => setShowShareModal(true)}>
                                    📤 مشاركة
                                </button>
                            </div>
                        </div>

                        <div className="episode-info-row">
                            {episode.episode_number && (
                                <span className="info-badge">الحلقة {episode.episode_number}</span>
                            )}
                            {episode.duration && (
                                <span className="info-badge">{episode.duration} دقيقة</span>
                            )}
                            {episode.created_at && (
                                <span className="info-badge">
                                    {new Date(episode.created_at).toLocaleDateString('ar-EG')}
                                </span>
                            )}
                        </div>

                        {episode.description && (
                            <p className="episode-description">{episode.description}</p>
                        )}
                    </div>

                    {/* Mobile Episodes List */}
                    <div className="mobile-episodes-section">
                        <div className="mobile-episodes-header">
                            <h3>حلقات المسلسل</h3>
                            <span>{seriesEpisodes.length}</span>
                        </div>
                        <div className="mobile-search">
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="mobile-episodes-list">
                            {filteredEpisodes.slice(0, 10).map((ep) => (
                                <div key={ep.id} className="mobile-ep-row">
                                    <Link
                                        to={`/episodes/${ep.id}`}
                                        className={`mobile-episode-item ${ep.id === episode.id ? 'active' : ''}`}
                                    >
                                        <div className="episode-thumb-small">
                                            {ep.thumbnail ? (
                                                <img src={getImageUrl(ep.thumbnail)} alt="" />
                                            ) : (
                                                <span>📺</span>
                                            )}
                                            {ep.id === episode.id && <div className="now-playing">▶️</div>}
                                        </div>
                                        <div className="episode-info-small">
                                            <span className="ep-number">الحلقة {ep.episode_number}</span>
                                            {ep.title && <span className="ep-title">{ep.title}</span>}
                                        </div>
                                    </Link>
                                    <div className="ep-options-container">
                                        <button
                                            className="ep-options-trigger"
                                            onClick={(e) => toggleOptionsMenu(e, ep.id)}
                                        >
                                            ⋮
                                        </button>
                                        {activeOptionsMenu === ep.id && (
                                            <div className="ep-options-dropdown" onClick={(e) => e.stopPropagation()}>
                                                <EpisodeOptionsMenu
                                                    episode={ep}
                                                    onClose={() => setActiveOptionsMenu(null)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <CommentsSection
                        comments={comments}
                        episodeId={episode.id}
                        onCommentAdded={(newComment) => setComments([newComment, ...comments])}
                    />
                </div>

                {/* Sidebar (Desktop) */}
                <div className="sidebar">
                    {/* Series Episodes */}
                    <div className="sidebar-section">
                        <div className="sidebar-header">
                            <h3>حلقات المسلسل</h3>
                            <span className="count">{seriesEpisodes.length}</span>
                        </div>
                        <div className="sidebar-search">
                            <input
                                type="text"
                                placeholder="بحث عن الحلقة..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="sidebar-episodes-list">
                            {filteredEpisodes.map((ep) => (
                                <div key={ep.id} className="sidebar-ep-row">
                                    <Link
                                        to={`/episodes/${ep.id}`}
                                        className={`sidebar-episode ${ep.id === episode.id ? 'active' : ''}`}
                                    >
                                        <div className="sidebar-ep-thumb">
                                            {ep.thumbnail ? (
                                                <img src={getImageUrl(ep.thumbnail)} alt="" />
                                            ) : (
                                                <span>📺</span>
                                            )}
                                            {ep.id === episode.id && <div className="playing-badge">▶️</div>}
                                        </div>
                                        <div className="sidebar-ep-info">
                                            <span className="sidebar-ep-number">الحلقة {ep.episode_number}</span>
                                            {ep.title && <span className="sidebar-ep-title">{ep.title}</span>}
                                            {ep.duration && <span className="sidebar-ep-duration">{ep.duration} د</span>}
                                        </div>
                                    </Link>
                                    <div className="ep-options-container">
                                        <button
                                            className="ep-options-trigger"
                                            onClick={(e) => toggleOptionsMenu(e, `sidebar-${ep.id}`)}
                                        >
                                            ⋮
                                        </button>
                                        {activeOptionsMenu === `sidebar-${ep.id}` && (
                                            <div className="ep-options-dropdown" onClick={(e) => e.stopPropagation()}>
                                                <EpisodeOptionsMenu
                                                    episode={ep}
                                                    onClose={() => setActiveOptionsMenu(null)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Latest Episodes */}
                    <div className="sidebar-section">
                        <div className="sidebar-header">
                            <h3>أحدث الحلقات</h3>
                        </div>
                        <div className="sidebar-episodes-list">
                            {latestEpisodes.map((ep) => (
                                <div key={ep.id} className="sidebar-ep-row">
                                    <Link
                                        to={`/episodes/${ep.id}`}
                                        className="sidebar-episode"
                                    >
                                        <div className="sidebar-ep-thumb">
                                            {ep.thumbnail ? (
                                                <img src={getImageUrl(ep.thumbnail)} alt="" />
                                            ) : (
                                                <span>📺</span>
                                            )}
                                        </div>
                                        <div className="sidebar-ep-info">
                                            <span className="sidebar-ep-series">{ep.series?.title}</span>
                                            <span className="sidebar-ep-number">الحلقة {ep.episode_number}</span>
                                        </div>
                                    </Link>
                                    <div className="ep-options-container">
                                        <button
                                            className="ep-options-trigger"
                                            onClick={(e) => toggleOptionsMenu(e, `latest-${ep.id}`)}
                                        >
                                            ⋮
                                        </button>
                                        {activeOptionsMenu === `latest-${ep.id}` && (
                                            <div className="ep-options-dropdown" onClick={(e) => e.stopPropagation()}>
                                                <EpisodeOptionsMenu
                                                    episode={ep}
                                                    onClose={() => setActiveOptionsMenu(null)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Server Modal */}
            {showServerModal && (
                <div className="modal-overlay" onClick={() => setShowServerModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>اختر السيرفر</h3>
                            <button onClick={() => setShowServerModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {videos.map((video, index) => (
                                <button
                                    key={index}
                                    className={`server-btn ${currentVideo === video.video_url ? 'active' : ''}`}
                                    onClick={() => {
                                        setCurrentVideo(video.video_url);
                                        setShowServerModal(false);
                                    }}
                                >
                                    <span>🖥️</span>
                                    <span>{video.server_name || `سيرفر ${index + 1}`}</span>
                                    {currentVideo === video.video_url && <span className="check">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>مشاركة الحلقة</h3>
                            <button onClick={() => setShowShareModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="share-buttons">
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="share-btn facebook"
                                >
                                    📘 فيسبوك
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(episode.title || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="share-btn twitter"
                                >
                                    🐦 تويتر
                                </a>
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="share-btn whatsapp"
                                >
                                    💬 واتساب
                                </a>
                                <button
                                    className="share-btn copy"
                                    onClick={() => {
                                        navigator.clipboard.writeText(shareUrl);
                                        alert('تم نسخ الرابط!');
                                    }}
                                >
                                    📋 نسخ الرابط
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EpisodeShowPage;
