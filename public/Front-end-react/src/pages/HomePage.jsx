import { useState, useEffect } from 'react';
import { homeService } from '../services/api';
import EpisodeCard from '../components/EpisodeCard';
import AnimeCard from '../components/AnimeCard';
import './HomePage.css';

function HomePage() {
    const [episodes, setEpisodes] = useState([]);
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async (searchTerm = '') => {
        try {
            setLoading(true);
            setError(null);
            const data = await homeService.getHome(searchTerm);
            setEpisodes(data.episodes?.data || []);
            setAnimes(data.animes || []);
        } catch (err) {
            setError('حدث خطأ في تحميل البيانات');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchHomeData(search);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>جاري التحميل...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => fetchHomeData()}>إعادة المحاولة</button>
            </div>
        );
    }

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>مرحباً بك في أنمي لاست</h1>
                    <p>شاهد أحدث الحلقات والأنميات المترجمة</p>

                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="ابحث عن أنمي أو حلقة..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit">بحث</button>
                    </form>
                </div>
            </section>

            {/* Latest Episodes Section */}
            <section className="content-section">
                <div className="section-header">
                    <h2>آخر الحلقات</h2>
                    <span className="section-badge">{episodes.length} حلقة</span>
                </div>
                <div className="episodes-grid">
                    {episodes.map((episode) => (
                        <EpisodeCard key={episode.id} episode={episode} />
                    ))}
                </div>
            </section>

            {/* Anime List Section */}
            <section className="content-section">
                <div className="section-header">
                    <h2>قائمة الأنمي</h2>
                    <span className="section-badge">{animes.length} أنمي</span>
                </div>
                <div className="anime-grid">
                    {animes.slice(0, 12).map((anime) => (
                        <AnimeCard key={anime.id} anime={anime} />
                    ))}
                </div>
            </section>
        </div>
    );
}

export default HomePage;
