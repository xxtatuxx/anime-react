import { useState, useEffect } from 'react';
import { homeService } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import './MoviesPage.css';

function MoviesPage() {
    const [movies, setMovies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async (searchTerm = '') => {
        try {
            setLoading(true);
            setError(null);
            const params = searchTerm ? { search: searchTerm } : {};
            const data = await homeService.getMovies(params);
            setMovies(data.animes?.data || []);
            setCategories(data.categories || []);
        } catch (err) {
            setError('حدث خطأ في تحميل البيانات');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMovies(search);
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
        <div className="movies-page">
            <div className="page-header">
                <div className="header-icon">🎬</div>
                <h1>أفلام الأنمي</h1>
                <p>شاهد أفضل أفلام الأنمي المترجمة</p>
            </div>

            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="ابحث عن فيلم..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit">بحث</button>
            </form>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => fetchMovies()}>إعادة المحاولة</button>
                </div>
            )}

            <div className="movies-grid-container">
                <div className="results-info">
                    <span>{movies.length} فيلم</span>
                </div>
                <div className="movies-grid">
                    {movies.map((movie) => (
                        <AnimeCard key={movie.id} anime={movie} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MoviesPage;
