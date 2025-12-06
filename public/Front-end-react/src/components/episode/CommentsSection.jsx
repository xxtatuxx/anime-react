import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import CommentItem from './CommentItem';
import './CommentsSection.css';

// Common emojis for picker
const EMOJIS = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '❤️', '💕', '👍', '👎', '🔥', '⭐', '✨', '🎉', '💯', '👏', '🙏', '💪'];

function CommentsSection({ comments: initialComments, episodeId, onCommentAdded }) {
    const { user } = useAuth();
    const [comments, setComments] = useState(initialComments || []);
    const [newComment, setNewComment] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add comment
    const handleAddComment = async () => {
        if (!newComment.trim() || isSubmitting) return;

        if (!user) {
            window.location.href = '#/login';
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post(`/api/react/comments`, {
                episode_id: episodeId,
                content: newComment
            });

            // Add new comment to list
            const addedComment = response.data.comment || {
                id: Date.now(),
                content: newComment,
                user: { name: user.name, avatar: user.avatar },
                user_id: user.id,
                created_at: new Date().toISOString(),
                likes: 0,
                dislikes: 0,
                replies: []
            };

            setComments([addedComment, ...comments]);
            setNewComment('');
            setIsInputFocused(false);
            if (onCommentAdded) onCommentAdded(addedComment);
        } catch (error) {
            console.error('Failed to add comment:', error);
            alert('حدث خطأ أثناء إضافة التعليق');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add emoji to comment
    const addEmoji = (emoji) => {
        setNewComment(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    // Update comment in state (after like/reply)
    const updateComment = (commentId, updatedData) => {
        setComments(prev => prev.map(c =>
            c.id === commentId ? { ...c, ...updatedData } : c
        ));
    };

    // Add reply to comment
    const addReplyToComment = (commentId, reply) => {
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                return {
                    ...c,
                    replies: [...(c.replies || []), reply]
                };
            }
            return c;
        }));
    };

    // Delete comment
    const deleteComment = (commentId) => {
        setComments(prev => prev.filter(c => c.id !== commentId));
    };

    // Get avatar URL
    const getAvatarUrl = (avatar) => {
        if (!avatar) return null;
        if (avatar.startsWith('http')) return avatar;
        if (avatar.startsWith('/storage/')) return `${window.location.origin}${avatar}`;
        return `${window.location.origin}/storage/${avatar}`;
    };

    return (
        <div className="comments-section-full">
            <div className="comments-header-full">
                <h3>{comments.length} تعليق</h3>
                <button className="sort-btn">
                    ↕️ الترتيب حسب
                </button>
            </div>

            {/* Add Comment Input */}
            <div className="add-comment-box">
                <div className="user-avatar">
                    {user?.avatar ? (
                        <img src={getAvatarUrl(user.avatar)} alt={user.name} />
                    ) : (
                        <span>{user?.name?.[0] || 'U'}</span>
                    )}
                </div>
                <div className="comment-input-wrapper">
                    <div className="textarea-container">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onFocus={() => setIsInputFocused(true)}
                            placeholder="إضافة تعليق..."
                            rows={isInputFocused ? 3 : 1}
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

                    {(isInputFocused || newComment) && (
                        <div className="comment-actions-row">
                            <button
                                className="cancel-btn"
                                onClick={() => {
                                    setIsInputFocused(false);
                                    setNewComment('');
                                }}
                            >
                                إلغاء
                            </button>
                            <button
                                className="submit-btn"
                                onClick={handleAddComment}
                                disabled={!newComment.trim() || isSubmitting}
                            >
                                {isSubmitting ? 'جاري الإرسال...' : 'تعليق'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Comments List */}
            <div className="comments-list-full">
                {comments.length === 0 ? (
                    <div className="no-comments-message">
                        <span>💬</span>
                        <p>لا توجد تعليقات بعد. كن أول من يعلق!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            episodeId={episodeId}
                            currentUser={user}
                            onUpdate={updateComment}
                            onReplyAdded={addReplyToComment}
                            onDelete={deleteComment}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default CommentsSection;
