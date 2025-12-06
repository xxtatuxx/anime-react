import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    TextInput,
    Image,
    Platform,
    Dimensions,
} from 'react-native';
import { Video } from 'expo-av';
import { homeService, userService, API_BASE_URL } from '../services/api';

const { width, height } = Dimensions.get('window');

const EpisodePlayerScreen = ({ route, navigation }) => {
    const { episodeId } = route.params;
    const videoRef = useRef(null);

    // Episode data
    const [episode, setEpisode] = useState(null);
    const [series, setSeries] = useState(null);
    const [seriesEpisodes, setSeriesEpisodes] = useState([]);
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Comments
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        fetchEpisode();
    }, [episodeId]);

    const fetchEpisode = async () => {
        try {
            const data = await homeService.getEpisodeShow(episodeId);
            setEpisode(data.episode);
            setSeries(data.series);
            setSeriesEpisodes(data.seriesEpisodes?.data || []);
            setVideos(data.videos || []);
            setComments(data.comments || []);

            // Select first video by default
            if (data.videos && data.videos.length > 0) {
                setSelectedVideo(data.videos[0]);
            }
        } catch (error) {
            console.error('Failed to fetch episode:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/120x80';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}/storage/${path}`;
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            await userService.addComment(episodeId, newComment, replyingTo?.id);
            setNewComment('');
            setReplyingTo(null);
            await fetchEpisode(); // Refresh comments
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleLikeComment = async (commentId, isLike) => {
        try {
            await userService.likeComment(commentId, isLike);
            await fetchEpisode(); // Refresh to get updated counts
        } catch (error) {
            console.error('Failed to like comment:', error);
        }
    };

    const renderEpisodeItem = ({ item }) => {
        const isCurrentEpisode = item.id === episodeId;
        return (
            <TouchableOpacity
                style={[styles.episodeItem, isCurrentEpisode && styles.currentEpisode]}
                onPress={() => !isCurrentEpisode && navigation.replace('EpisodePlayer', { episodeId: item.id })}
            >
                <Image
                    source={{ uri: getImageUrl(item.image) }}
                    style={styles.episodeThumbnail}
                    resizeMode="cover"
                />
                <View style={styles.episodeItemInfo}>
                    <Text style={styles.episodeItemNumber}>الحلقة {item.episode_number}</Text>
                    <Text style={styles.episodeItemTitle} numberOfLines={1}>{item.title}</Text>
                    {item.duration && (
                        <Text style={styles.episodeItemDuration}>⏱ {item.duration}</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderComment = (comment, isReply = false) => (
        <View key={comment.id} style={[styles.commentCard, isReply && styles.replyCard]}>
            <View style={styles.commentHeader}>
                <View style={styles.commentUser}>
                    <Text style={styles.commenterName}>{comment.user?.name || 'مستخدم'}</Text>
                    <Text style={styles.commentTime}>{comment.created_at}</Text>
                </View>
            </View>

            <Text style={styles.commentContent}>{comment.content}</Text>

            <View style={styles.commentActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleLikeComment(comment.id, true)}
                >
                    <Text style={styles.actionIcon}>👍</Text>
                    <Text style={styles.actionText}>{comment.likes || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleLikeComment(comment.id, false)}
                >
                    <Text style={styles.actionIcon}>👎</Text>
                    <Text style={styles.actionText}>{comment.dislikes || 0}</Text>
                </TouchableOpacity>

                {!isReply && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setReplyingTo(comment)}
                    >
                        <Text style={styles.actionIcon}>💬</Text>
                        <Text style={styles.actionText}>رد</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Render replies */}
            {comment.replies && comment.replies.length > 0 && (
                <View style={styles.repliesContainer}>
                    {comment.replies.map(reply => renderComment(reply, true))}
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#e94560" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Video Player */}
            <View style={styles.videoContainer}>
                {selectedVideo && selectedVideo.url ? (
                    <Video
                        ref={videoRef}
                        source={{ uri: selectedVideo.url }}
                        style={styles.video}
                        useNativeControls
                        resizeMode="contain"
                        shouldPlay
                    />
                ) : (
                    <View style={styles.noVideo}>
                        <Text style={styles.noVideoText}>لا يوجد فيديو متاح</Text>
                    </View>
                )}
            </View>

            {/* Episode Info */}
            <View style={styles.episodeInfo}>
                <Text style={styles.episodeTitle}>{episode?.title}</Text>
                <Text style={styles.seriesName}>{series?.title}</Text>
            </View>

            {/* Server Selection */}
            {videos.length > 0 && (
                <ScrollView horizontal style={styles.serversContainer} showsHorizontalScrollIndicator={false}>
                    {videos.map((video, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.serverButton, selectedVideo?.id === video.id && styles.serverButtonActive]}
                            onPress={() => setSelectedVideo(video)}
                        >
                            <Text style={[styles.serverButtonText, selectedVideo?.id === video.id && styles.serverButtonTextActive]}>
                                سيرفر {index + 1}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <View style={styles.content}>
                {/* Episodes List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📺 حلقات المسلسل</Text>
                    <FlatList
                        data={seriesEpisodes}
                        renderItem={renderEpisodeItem}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.episodesList}
                    />
                </View>

                {/* Comments Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💬 التعليقات ({comments.length})</Text>

                    {/* Add Comment */}
                    <View style={styles.addCommentContainer}>
                        {replyingTo && (
                            <View style={styles.replyingToBar}>
                                <Text style={styles.replyingToText}>
                                    الرد على: {replyingTo.user?.name}
                                </Text>
                                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                                    <Text style={styles.cancelReply}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder={replyingTo ? "اكتب ردك..." : "أضف تعليق..."}
                                value={newComment}
                                onChangeText={setNewComment}
                                multiline
                            />
                            <TouchableOpacity
                                style={styles.sendButton}
                                onPress={handleAddComment}
                                disabled={submittingComment || !newComment.trim()}
                            >
                                {submittingComment ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.sendButtonText}>إرسال</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Comments List */}
                    <ScrollView style={styles.commentsScroll}>
                        {comments.length === 0 ? (
                            <Text style={styles.noComments}>لا توجد تعليقات بعد</Text>
                        ) : (
                            comments.map(comment => renderComment(comment))
                        )}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f23',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f0f23',
    },
    videoContainer: {
        width: '100%',
        height: width * (9 / 16), // 16:9 aspect ratio
        backgroundColor: '#000',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    noVideo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noVideoText: {
        color: '#fff',
        fontSize: 16,
    },
    episodeInfo: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a2e',
    },
    episodeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    seriesName: {
        fontSize: 14,
        color: '#aaa',
    },
    serversContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a2e',
    },
    serverButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1a1a2e',
        marginRight: 8,
    },
    serverButtonActive: {
        backgroundColor: '#e94560',
    },
    serverButtonText: {
        color: '#aaa',
        fontSize: 14,
    },
    serverButtonTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        padding: 16,
        paddingBottom: 8,
    },
    episodesList: {
        paddingLeft: 16,
    },
    episodeItem: {
        width: 160,
        marginRight: 12,
        backgroundColor: '#1a1a2e',
        borderRadius: 8,
        overflow: 'hidden',
    },
    currentEpisode: {
        borderWidth: 2,
        borderColor: '#e94560',
    },
    episodeThumbnail: {
        width: '100%',
        height: 90,
    },
    episodeItemInfo: {
        padding: 8,
    },
    episodeItemNumber: {
        color: '#e94560',
        fontSize: 12,
        fontWeight: 'bold',
    },
    episodeItemTitle: {
        color: '#fff',
        fontSize: 13,
        marginTop: 2,
    },
    episodeItemDuration: {
        color: '#aaa',
        fontSize: 11,
        marginTop: 4,
    },
    addCommentContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    replyingToBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        padding: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    replyingToText: {
        color: '#e94560',
        fontSize: 12,
    },
    cancelReply: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    commentInput: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        color: '#fff',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#e94560',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    commentsScroll: {
        paddingHorizontal: 16,
        maxHeight: 400,
    },
    noComments: {
        color: '#aaa',
        textAlign: 'center',
        padding: 20,
    },
    commentCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    replyCard: {
        marginLeft: 20,
        backgroundColor: '#16162a',
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    commentUser: {
        flex: 1,
    },
    commenterName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    commentTime: {
        color: '#aaa',
        fontSize: 11,
        marginTop: 2,
    },
    commentContent: {
        color: '#ddd',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 8,
    },
    commentActions: {
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionIcon: {
        fontSize: 14,
    },
    actionText: {
        color: '#aaa',
        fontSize: 12,
    },
    repliesContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#0f0f23',
    },
});

export default EpisodePlayerScreen;
