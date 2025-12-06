import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Linking,
} from 'react-native';
import { homeService, API_BASE_URL } from '../services/api';

const { width } = Dimensions.get('window');

const EpisodeDetailScreen = ({ route, navigation }) => {
    const { episodeId } = route.params;
    const [episode, setEpisode] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEpisode();
    }, [episodeId]);

    const fetchEpisode = async () => {
        try {
            const data = await homeService.getEpisodeShow(episodeId);
            setEpisode(data.episode);
        } catch (error) {
            console.error('Failed to fetch episode:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/400x225';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}/storage/${path}`;
    };

    const openVideo = (url) => {
        if (url) {
            Linking.openURL(url);
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#e94560" />
            </View>
        );
    }

    if (!episode) {
        return (
            <View style={styles.error}>
                <Text style={styles.errorText}>الحلقة غير موجودة</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Video Thumbnail */}
            <TouchableOpacity
                style={styles.videoContainer}
                onPress={() => openVideo(episode.video_url)}
                activeOpacity={0.9}
            >
                <Image
                    source={{ uri: getImageUrl(episode.image) }}
                    style={styles.videoThumbnail}
                    resizeMode="cover"
                />
                <View style={styles.playButton}>
                    <Text style={styles.playIcon}>▶️</Text>
                </View>
            </TouchableOpacity>

            {/* Episode Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{episode.title}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaIcon}>📺</Text>
                        <Text style={styles.metaText}>الحلقة {episode.episode_number}</Text>
                    </View>
                    {episode.duration && (
                        <View style={styles.metaItem}>
                            <Text style={styles.metaIcon}>⏱</Text>
                            <Text style={styles.metaText}>{episode.duration} دقيقة</Text>
                        </View>
                    )}
                </View>

                {/* Series Info */}
                {episode.series && (
                    <TouchableOpacity
                        style={styles.seriesCard}
                        onPress={() => navigation.navigate('AnimeDetail', { animeId: episode.series.id })}
                    >
                        <Image
                            source={{ uri: getImageUrl(episode.series.poster_image) }}
                            style={styles.seriesPoster}
                            resizeMode="cover"
                        />
                        <View style={styles.seriesInfo}>
                            <Text style={styles.seriesTitle}>{episode.series.arabic_title}</Text>
                            <Text style={styles.seriesSubtitle}>{episode.series.title}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Video Quality Options */}
                {episode.video_sources && episode.video_sources.length > 0 && (
                    <View style={styles.qualitySection}>
                        <Text style={styles.sectionTitle}>🎬 جودة المشاهدة</Text>
                        <View style={styles.qualityButtons}>
                            {episode.video_sources.map((source, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.qualityButton}
                                    onPress={() => openVideo(source.url)}
                                >
                                    <Text style={styles.qualityText}>{source.quality || '720p'}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Description */}
                {episode.description && (
                    <View style={styles.descriptionSection}>
                        <Text style={styles.sectionTitle}>📝 الوصف</Text>
                        <Text style={styles.description}>{episode.description}</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0b',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0b',
    },
    error: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0b',
    },
    errorText: {
        color: '#666',
        fontSize: 16,
    },
    videoContainer: {
        width: '100%',
        height: width * 0.56,
        backgroundColor: '#000',
        position: 'relative',
    },
    videoThumbnail: {
        width: '100%',
        height: '100%',
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -30 }, { translateY: -30 }],
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(233, 69, 96, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        fontSize: 24,
    },
    infoContainer: {
        padding: 16,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'right',
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaIcon: {
        fontSize: 16,
    },
    metaText: {
        color: '#888',
        fontSize: 14,
    },
    seriesCard: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1b',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        gap: 12,
    },
    seriesPoster: {
        width: 60,
        height: 80,
        borderRadius: 8,
    },
    seriesInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    seriesTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'right',
    },
    seriesSubtitle: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'right',
    },
    qualitySection: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'right',
    },
    qualityButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    qualityButton: {
        backgroundColor: '#e94560',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    qualityText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    descriptionSection: {
        marginBottom: 20,
    },
    description: {
        color: '#aaa',
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'right',
    },
});

export default EpisodeDetailScreen;
