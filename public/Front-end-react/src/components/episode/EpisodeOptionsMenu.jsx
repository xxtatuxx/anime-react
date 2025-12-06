import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './EpisodeOptionsMenu.css';

function EpisodeOptionsMenu({ episode, onClose }) {
    const { user } = useAuth();
    const [showShareModal, setShowShareModal] = useState(false);
    const [isAddingToWatchLater, setIsAddingToWatchLater] = useState(false);
    const [addedToWatchLater, setAddedToWatchLater] = useState(false);

    // Handle add to watch later
    const handleAddToWatchLater = async () => {
        if (!user) {
            window.location.href = '#/login';
            return;
        }

        setIsAddingToWatchLater(true);
        try {
            await api.post(`/api/react/watch-later/${episode.id}`);
            setAddedToWatchLater(true);
            setTimeout(() => {
                setAddedToWatchLater(false);
                if (onClose) onClose();
            }, 1500);
        } catch (error) {
            console.error('Failed to add to watch later:', error);
            alert('حدث خطأ أثناء الإضافة');
        } finally {
            setIsAddingToWatchLater(false);
        }
    };

    // Handle share
    const handleShare = () => {
        setShowShareModal(true);
    };

    // Get episode URL
    const episodeUrl = `${window.location.origin}${window.location.pathname}#/episodes/${episode.id}`;

    // Share to social media
    const shareToFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(episodeUrl)}`, '_blank');
    };

    const shareToTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(episodeUrl)}&text=${encodeURIComponent(episode.title || '')}`, '_blank');
    };

    const shareToWhatsapp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(episodeUrl)}`, '_blank');
    };

    const copyLink = () => {
        navigator.clipboard.writeText(episodeUrl);
        alert('تم نسخ الرابط!');
        setShowShareModal(false);
        if (onClose) onClose();
    };

    return (
        <>
            <div className="episode-options-menu">
                <button
                    className="option-item"
                    onClick={handleAddToWatchLater}
                    disabled={isAddingToWatchLater}
                >
                    {addedToWatchLater ? (
                        <>
                            <span className="option-icon success">✓</span>
                            <span>تمت الإضافة</span>
                        </>
                    ) : (
                        <>
                            <span className="option-icon">🕐</span>
                            <span>{isAddingToWatchLater ? 'جاري الإضافة...' : 'مشاهدة لاحقاً'}</span>
                        </>
                    )}
                </button>
                <button
                    className="option-item"
                    onClick={handleShare}
                >
                    <span className="option-icon">📤</span>
                    <span>مشاركة</span>
                </button>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="share-modal-header">
                            <h3>مشاركة الحلقة</h3>
                            <button onClick={() => setShowShareModal(false)}>✕</button>
                        </div>
                        <div className="share-modal-body">
                            <button className="share-btn facebook" onClick={shareToFacebook}>
                                📘 فيسبوك
                            </button>
                            <button className="share-btn twitter" onClick={shareToTwitter}>
                                🐦 تويتر
                            </button>
                            <button className="share-btn whatsapp" onClick={shareToWhatsapp}>
                                💬 واتساب
                            </button>
                            <button className="share-btn copy" onClick={copyLink}>
                                📋 نسخ الرابط
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default EpisodeOptionsMenu;
