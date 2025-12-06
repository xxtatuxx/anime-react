import { useState, useEffect } from 'react';
import { homeService } from '../services/api';
import EpisodeCard from '../components/EpisodeCard';
import './EpisodesPage.css';

function EpisodesPage() {
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchEpisodes();
    }, []);

    const fetchEpisodes = async (pageNum = 1, searchTerm = '', append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const data = await homeService.getEpisodes(pageNum, searchTerm);
            const newEpisodes = data.data || [];

            if (append) {
                setEpisodes(prev => [...prev, ...newEpisodes]);
            } else {
                setEpisodes(newEpisodes);
            }

            setHasMore(data.next_page_url !== null);
            setPage(pageNum);
        } catch (err) {
            setError('حدث خطأ في تحميل البيانات');
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchEpisodes(1, search);
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchEpisodes(page + 1, search, true);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>جاري التحميل...</p>
            </div>
        );
    }

    return (
        <div className="episodes-page">
            <div className="page-header">
                <div className="header-icon">📺</div>
                <h1>جميع الحلقات</h1>
                <p>تصفح أحدث الحلقات المترجمة</p>
            </div>

            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="ابحث عن حلقة أو أنمي..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit">بحث</button>
            </form>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => fetchEpisodes()}>إعادة المحاولة</button>
                </div>
            )}

            <div className="episodes-grid-container">
                <div className="results-info">
                    <span>{episodes.length} حلقة</span>
                </div>
                <div className="episodes-grid">
                    {episodes.map((episode) => (
                        <EpisodeCard key={episode.id} episode={episode} />
                    ))}
                </div>

                {hasMore && (
                    <div className="load-more-container">
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="load-more-btn"
                        >
                            {loadingMore ? 'جاري التحميل...' : 'تحميل المزيد'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EpisodesPage;
