import { useState, useEffect } from 'react';
import { homeService } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import './AnimePage.css';

function AnimePage() {
    const [animes, setAnimes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        season: '',
        status: '',
        search: ''
    });

    useEffect(() => {
        fetchAnime();
    }, []);

    const fetchAnime = async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const data = await homeService.getAnime(params);
            setAnimes(data.animes?.data || []);
            setCategories(data.categories || []);
            setSeasons(data.seasons || []);
        } catch (err) {
            setError('حدث خطأ في تحميل البيانات');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (name, value) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);

        const params = {};
        if (newFilters.category) params.category = newFilters.category;
        if (newFilters.season) params.season = newFilters.season;
        if (newFilters.status) params.status = newFilters.status;
        if (newFilters.search) params.search = newFilters.search;

        fetchAnime(params);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        handleFilterChange('search', filters.search);
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
        <div className="anime-page">
            <div className="page-header">
                <h1>قائمة الأنمي</h1>
                <p>تصفح مجموعتنا الكاملة من الأنميات</p>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <form onSubmit={handleSearch} className="search-box">
                    <input
                        type="text"
                        placeholder="ابحث عن أنمي..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                    <button type="submit">بحث</button>
                </form>

                <div className="filter-options">
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                        <option value="">جميع التصنيفات</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>

                    <select
                        value={filters.season}
                        onChange={(e) => handleFilterChange('season', e.target.value)}
                    >
                        <option value="">جميع المواسم</option>
                        {seasons.map((season) => (
                            <option key={season.id} value={season.id}>{season.name}</option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">الحالة</option>
                        <option value="Active">مستمر</option>
                        <option value="Inactive">مكتمل</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => fetchAnime()}>إعادة المحاولة</button>
                </div>
            )}

            {/* Anime Grid */}
            <div className="anime-grid-container">
                <div className="results-info">
                    <span>{animes.length} نتيجة</span>
                </div>
                <div className="anime-grid">
                    {animes.map((anime) => (
                        <AnimeCard key={anime.id} anime={anime} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AnimePage;
