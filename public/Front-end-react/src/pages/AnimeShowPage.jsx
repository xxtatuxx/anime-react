import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import './AnimeShowPage.css';

// Helper to get image URL
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage/')) return `${window.location.origin}${path}`;
    return `${window.location.origin}/storage/${path}`;
};

function AnimeShowPage() {
    const { id } = useParams();
    const [anime, setAnime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchAnime = async () => {
            try {
                const response = await api.get(`/api/react/anime/${id}`);
                setAnime(response.data.anime);
            } catch (error) {
                console.error('Failed to fetch anime:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnime();
    }, [id]);

    if (loading) {
        return (
            <div className="anime-show-loading">
                <span className="spinner"></span>
                <span>جاري التحميل...</span>
            </div>
        );
    }

    if (!anime) {
        return (
            <div className="anime-show-error">
                <h2>لم يتم العثور على الأنمي</h2>
                <Link to="/" className="back-btn">الرجوع للرئيسية</Link>
            </div>
        );
    }

    // Filter episodes by search
    const filteredEpisodes = anime.episodes?.filter((ep) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            (ep.title && ep.title.toLowerCase().includes(query)) ||
            (ep.title_en && ep.title_en.toLowerCase().includes(query)) ||
            ep.episode_number?.toString().includes(query)
        );
    }) || [];

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Info items
    const infoItems = [
        { label: 'الحالة', value: anime.status },
        { label: 'النوع', value: anime.type },
        { label: 'الموسم', value: anime.season?.name },
        { label: 'الاستوديو', value: anime.studio_name },
        { label: 'اللغة', value: anime.language },
        { label: 'تاريخ العرض', value: formatDate(anime.release_date) },
        { label: 'المدة', value: anime.duration ? `${anime.duration} دقيقة` : null },
    ];

    return (
        <div className="anime-show-page" dir="rtl">
            {/* Header Card */}
            <div className="anime-header-card">
                <div className="anime-header-content">
                    {/* Poster */}
                    <div className="anime-poster">
                        {getImageUrl(anime.image) ? (
                            <img src={getImageUrl(anime.image)} alt={anime.title} />
                        ) : (
                            <div className="no-poster">لا توجد صورة</div>
                        )}
                        {anime.rating && (
                            <div className="rating-badge">
                                <span>⭐</span>
                                <span>{anime.rating}</span>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="anime-info">
                        <div className="anime-titles">
                            <h1>{anime.title}</h1>
                            {anime.title_en && <h2>{anime.title_en}</h2>}
                        </div>

                        <p className="anime-description">
                            {anime.description || anime.description_en || 'لا يوجد وصف متاح.'}
                        </p>

                        {/* Info Grid */}
                        <div className="info-grid">
                            {infoItems.filter(item => item.value).map((item, index) => (
                                <div key={index} className="info-item">
                                    <span className="info-label">{item.label}</span>
                                    <span className="info-value">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Categories */}
                        {anime.categories?.length > 0 && (
                            <div className="categories-row">
                                {anime.categories.map((cat, index) => (
                                    <span key={index} className="category-tag">{cat.name}</span>
                                ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            {anime.stream_video && (
                                <a href={anime.stream_video} target="_blank" rel="noopener noreferrer" className="btn-primary">
                                    ▶️ مشاهدة الآن
                                </a>
                            )}
                            {anime.trailer && (
                                <a href={anime.trailer} target="_blank" rel="noopener noreferrer" className="btn-outline">
                                    🎬 الإعلان التشويقي
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Episodes Section */}
            {anime.episodes?.length > 0 && (
                <div className="episodes-section">
                    <div className="episodes-header">
                        <div className="episodes-title">
                            <h2>الحلقات</h2>
                            <span className="episodes-count">{anime.episodes.length}</span>
                        </div>

                        <div className="search-wrapper">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="بحث عن رقم الحلقة..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredEpisodes.length > 0 ? (
                        <div className="episodes-grid">
                            {filteredEpisodes.map((episode) => (
                                <Link
                                    key={episode.id}
                                    to={`/episodes/${episode.id}`}
                                    className="episode-card"
                                >
                                    <div className="episode-thumb">
                                        {episode.thumbnail ? (
                                            <img src={getImageUrl(episode.thumbnail)} alt={episode.title} />
                                        ) : (
                                            <div className="no-thumb">📺</div>
                                        )}
                                        <div className="play-overlay">
                                            <span>▶️</span>
                                        </div>
                                        <span className="episode-badge">حلقة {episode.episode_number}</span>
                                    </div>
                                    <div className="episode-info">
                                        <h3>{episode.title || `الحلقة ${episode.episode_number}`}</h3>
                                        <div className="episode-meta">
                                            {episode.duration && <span>{episode.duration} دقيقة</span>}
                                            {episode.created_at && (
                                                <span>{new Date(episode.created_at).toLocaleDateString('ar-EG')}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="no-episodes">
                            <span>🔍</span>
                            <p>لا توجد حلقات تطابق بحثك.</p>
                        </div>
                    )}
                </div>
            )}

            {!anime.episodes?.length && (
                <div className="no-episodes-section">
                    <span>📺</span>
                    <h3>لا توجد حلقات</h3>
                    <p>لم يتم إضافة أي حلقات لهذا الأنمي بعد.</p>
                </div>
            )}
        </div>
    );
}

export default AnimeShowPage;
