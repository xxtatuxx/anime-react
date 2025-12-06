import { useState } from 'react';
import api from '../../services/api';
import './CommentItem.css';

// Common emojis
const EMOJIS = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '❤️', '💕', '👍', '👎', '🔥', '⭐', '✨', '🎉', '💯', '👏', '🙏'];

function CommentItem({ comment, episodeId, currentUser, onUpdate, onReplyAdded, onDelete, depth = 0 }) {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [editText, setEditText] = useState(comment.content);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get avatar URL
    const getAvatarUrl = (avatar) => {
        if (!avatar) return null;
        if (avatar.startsWith('http')) return avatar;
        if (avatar.startsWith('/storage/')) return `${window.location.origin}${avatar}`;
        return `${window.location.origin}/storage/${avatar}`;
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 7) return `منذ ${days} يوم`;
        return date.toLocaleDateString('ar-EG');
    };

    // Toggle like
    const handleLike = async (isLike) => {
        if (!currentUser) {
            window.location.href = '#/login';
            return;
        }

        try {
            await api.post(`/api/react/comments/${comment.id}/like`, { is_like: isLike });

            // Optimistic update
            const wasLiked = comment.user_interaction === true;
            const wasDisliked = comment.user_interaction === false;

            let newLikes = comment.likes || 0;
            let newDislikes = comment.dislikes || 0;
            let newInteraction = null;

            if (isLike) {
                if (wasLiked) {
                    newLikes--;
                    newInteraction = null;
                } else {
                    if (wasDisliked) newDislikes--;
                    newLikes++;
                    newInteraction = true;
                }
            } else {
                if (wasDisliked) {
                    newDislikes--;
                    newInteraction = null;
                } else {
                    if (wasLiked) newLikes--;
                    newDislikes++;
                    newInteraction = false;
                }
            }

            onUpdate(comment.id, {
                likes: newLikes,
                dislikes: newDislikes,
                user_interaction: newInteraction
            });
        } catch (error) {
            console.error('Failed to like:', error);
        }
    };

    // Submit reply
    const handleReply = async () => {
        if (!replyText.trim() || isSubmitting) return;

        if (!currentUser) {
            window.location.href = '#/login';
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post(`/api/react/comments`, {
                episode_id: episodeId,
                content: replyText,
                parent_id: comment.id
            });

            const newReply = response.data.comment || {
                id: Date.now(),
                content: replyText,
                user: { name: currentUser.name, avatar: currentUser.avatar },
                user_id: currentUser.id,
                created_at: new Date().toISOString(),
                likes: 0,
                dislikes: 0,
                replies: []
            };

            onReplyAdded(comment.id, newReply);
            setReplyText('');
            setIsReplying(false);
            setShowReplies(true);
        } catch (error) {
            console.error('Failed to reply:', error);
            alert('حدث خطأ أثناء إضافة الرد');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Submit edit
    const handleEdit = async () => {
        if (!editText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await api.put(`/api/react/comments/${comment.id}`, {
                content: editText
            });

            onUpdate(comment.id, { content: editText });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to edit:', error);
            alert('حدث خطأ أثناء التعديل');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete comment
    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

        try {
            await api.delete(`/api/react/comments/${comment.id}`);
            onDelete(comment.id);
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('حدث خطأ أثناء الحذف');
        }
    };

    // Add emoji
    const addEmoji = (emoji) => {
        if (isEditing) {
            setEditText(prev => prev + emoji);
        } else {
            setReplyText(prev => prev + emoji);
        }
        setShowEmojiPicker(false);
    };

    const userName = comment.user?.name || comment.user_name || 'مستخدم';
    const userAvatar = comment.user?.avatar || comment.user_avatar;
    const isOwner = currentUser && (currentUser.id === comment.user_id || currentUser.id === comment.user?.id);
    const replies = comment.replies || comment.children || [];

    return (
        <div className={`comment-item-full ${depth > 0 ? 'nested' : ''}`}>
            <div className="comment-row">
                {/* Avatar */}
                <div className="comment-avatar-full">
                    {userAvatar ? (
                        <img src={getAvatarUrl(userAvatar)} alt={userName} />
                    ) : (
                        <span>{userName[0]?.toUpperCase() || 'U'}</span>
                    )}
                </div>

                {/* Content */}
                <div className="comment-body">
                    {/* Header */}
                    <div className="comment-header-full">
                        <div className="comment-meta">
                            <span className="comment-author-name">{userName}</span>
                            <span className="comment-date-text">{formatDate(comment.created_at)}</span>
                        </div>

                        {isOwner && (
                            <div className="comment-menu">
                                <button
                                    className="menu-trigger"
                                    onClick={() => setShowMenu(!showMenu)}
                                >
                                    ⋮
                                </button>
                                {showMenu && (
                                    <div className="menu-dropdown">
                                        <button onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                                            ✏️ تعديل
                                        </button>
                                        <button onClick={() => { handleDelete(); setShowMenu(false); }} className="delete">
                                            🗑️ حذف
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Text or Edit Form */}
                    {isEditing ? (
                        <div className="edit-form">
                            <div className="textarea-container">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    rows={2}
                                />
                                <button
                                    className="emoji-trigger"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                >
                                    😊
                                </button>
                                {showEmojiPicker && (
                                    <div className="emoji-picker">
                                        {EMOJIS.map((emoji, i) => (
                                            <button key={i} onClick={() => addEmoji(emoji)}>
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="edit-actions">
                                <button className="cancel-btn" onClick={() => setIsEditing(false)}>إلغاء</button>
                                <button className="save-btn" onClick={handleEdit} disabled={isSubmitting}>
                                    {isSubmitting ? '...' : 'حفظ'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="comment-text-content">{comment.content}</p>
                    )}

                    {/* Actions Bar */}
                    <div className="comment-actions-bar">
                        <button
                            className={`action-btn like ${comment.user_interaction === true ? 'active' : ''}`}
                            onClick={() => handleLike(true)}
                        >
                            👍 <span>{comment.likes || 0}</span>
                        </button>
                        <button
                            className={`action-btn dislike ${comment.user_interaction === false ? 'active' : ''}`}
                            onClick={() => handleLike(false)}
                        >
                            👎 <span>{comment.dislikes || 0}</span>
                        </button>
                        <button
                            className="action-btn reply-btn"
                            onClick={() => setIsReplying(!isReplying)}
                        >
                            ↩️ رد
                        </button>
                    </div>

                    {/* Reply Form */}
                    {isReplying && (
                        <div className="reply-form">
                            <div className="reply-avatar">
                                {currentUser?.avatar ? (
                                    <img src={getAvatarUrl(currentUser.avatar)} alt="" />
                                ) : (
                                    <span>{currentUser?.name?.[0] || 'U'}</span>
                                )}
                            </div>
                            <div className="reply-input-wrapper">
                                <div className="textarea-container">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="اكتب ردك هنا..."
                                        rows={2}
                                        autoFocus
                                    />
                                    <button
                                        className="emoji-trigger"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    >
                                        😊
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="emoji-picker">
                                            {EMOJIS.map((emoji, i) => (
                                                <button key={i} onClick={() => addEmoji(emoji)}>
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="reply-actions">
                                    <button className="cancel-btn" onClick={() => setIsReplying(false)}>إلغاء</button>
                                    <button
                                        className="submit-btn"
                                        onClick={handleReply}
                                        disabled={!replyText.trim() || isSubmitting}
                                    >
                                        {isSubmitting ? '...' : 'رد'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nested Replies */}
                    {replies.length > 0 && (
                        <div className="replies-section">
                            <button
                                className="toggle-replies"
                                onClick={() => setShowReplies(!showReplies)}
                            >
                                {showReplies ? '▲ إخفاء الردود' : `▼ عرض ${replies.length} ردود`}
                            </button>

                            {showReplies && (
                                <div className="replies-list-nested">
                                    {replies.map((reply) => (
                                        <CommentItem
                                            key={reply.id}
                                            comment={reply}
                                            episodeId={episodeId}
                                            currentUser={currentUser}
                                            onUpdate={onUpdate}
                                            onReplyAdded={onReplyAdded}
                                            onDelete={onDelete}
                                            depth={depth + 1}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CommentItem;
