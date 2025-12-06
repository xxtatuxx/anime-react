import { Link } from 'react-router-dom';
import './AnimeCard.css';

// Helper to get correct image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/200x300?text=No+Image';

    // If it's already a full URL, return as-is
    if (imagePath.startsWith('http')) return imagePath;

    // Get the base URL (Laravel server)
    const baseUrl = window.location.origin;

    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

    // Check if it's a storage path
    if (cleanPath.startsWith('storage/')) {
        return `${baseUrl}/${cleanPath}`;
    }

    // Otherwise assume it's in storage
    return `${baseUrl}/storage/${cleanPath}`;
};

function AnimeCard({ anime }) {
    const imageUrl = getImageUrl(anime.image);
    const title = anime.title || 'غير معروف';
    const status = anime.is_active ? 'مستمر' : 'مكتمل';

    return (
        <Link to={`/anime/${anime.id}`} className="anime-card-link">
            <div className="anime-card">
                <div className="anime-poster">
                    <img
                        src={imageUrl}
                        alt={title}
                        loading="lazy"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200x300?text=No+Image'; }}
                    />
                    <div className="anime-status">
                        <span className={`status-badge ${anime.is_active ? 'ongoing' : 'completed'}`}>
                            {status}
                        </span>
                    </div>
                    <div className="anime-hover-overlay">
                        <span className="view-details">عرض التفاصيل</span>
                    </div>
                </div>
                <div className="anime-details">
                    <h3 className="anime-title">{title}</h3>
                    {anime.type && (
                        <span className="anime-type">{anime.type}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default AnimeCard;

