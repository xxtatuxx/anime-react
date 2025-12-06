import { Link } from 'react-router-dom';
import './EpisodeCard.css';

// Helper to get correct image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';

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

function EpisodeCard({ episode }) {
    const seriesTitle = episode.series?.title || 'غير معروف';
    const episodeNumber = episode.episode_number || '?';
    const thumbnail = getImageUrl(episode.thumbnail || episode.series?.image);

    return (
        <Link to={`/episodes/${episode.id}`} className="episode-card-link">
            <div className="episode-card">
                <div className="episode-thumbnail">
                    <img
                        src={thumbnail}
                        alt={episode.title || `الحلقة ${episodeNumber}`}
                        loading="lazy"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x169?text=No+Image'; }}
                    />
                    <div className="episode-overlay">
                        <span className="episode-number">الحلقة {episodeNumber}</span>
                    </div>
                    <div className="play-button">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
                <div className="episode-info">
                    <h3 className="episode-title">{episode.title || `الحلقة ${episodeNumber}`}</h3>
                    <p className="episode-series">{seriesTitle}</p>
                </div>
            </div>
        </Link>
    );
}

export default EpisodeCard;

