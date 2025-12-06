import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Dimensions,
} from 'react-native';
import { homeService, API_BASE_URL } from '../services/api';

const { width } = Dimensions.get('window');

const AnimeDetailScreen = ({ route, navigation }) => {
    const { animeId } = route.params;
    const [anime, setAnime] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnime();
    }, [animeId]);

    const fetchAnime = async () => {
        try {
            const data = await homeService.getAnimeShow(animeId);
            setAnime(data.series);
            setEpisodes(data.episodes || []);
        } catch (error) {
            console.error('Failed to fetch anime:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/300x400';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}/storage/${path}`;
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#e94560" />
            </View>
        );
    }

    if (!anime) {
        return (
            <View style={styles.error}>
                <Text style={styles.errorText}>الأنمي غير موجود</Text>
            </View>
        );
    }

    const renderEpisode = ({ item }) => (
        <TouchableOpacity
            style={styles.episodeCard}
            onPress={() => navigation.navigate('EpisodePlayer', { episodeId: item.id })}
        >
            <Image
                source={{ uri: getImageUrl(item.image) }}
                style={styles.episodeImage}
                resizeMode="cover"
            />
            <View style={styles.episodeInfo}>
                <Text style={styles.episodeNumber}>الحلقة {item.episode_number}</Text>
                <Text style={styles.episodeTitle} numberOfLines={1}>{item.title}</Text>
                {item.duration && (
                    <Text style={styles.episodeDuration}>⏱ {item.duration} دقيقة</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header with poster */}
            <View style={styles.header}>
                <Image
                    source={{ uri: getImageUrl(anime.cover_image || anime.poster_image) }}
                    style={styles.coverImage}
                    resizeMode="cover"
                />
                <View style={styles.overlay} />
                <View style={styles.headerContent}>
                    <Image
                        source={{ uri: getImageUrl(anime.poster_image) }}
                        style={styles.poster}
                        resizeMode="cover"
                    />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{anime.arabic_title}</Text>
                        <Text style={styles.subtitle}>{anime.title}</Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaText}>📅 {anime.release_year}</Text>
                            <Text style={styles.metaText}>📺 {episodes.length} حلقة</Text>
                        </View>
                    </View>
                </View>
            </View >

            {/* Info Cards */}
            < View style={styles.infoSection} >
                {
                    anime.status && (
                        <View style={[
                            styles.statusBadge,
                            anime.status === 'مكتمل' ? styles.completed : styles.ongoing
                        ]}>
                            <Text style={styles.statusText}>{anime.status}</Text>
                        </View>
                    )
                }

                {/* Genres */}
                {
                    anime.genres && anime.genres.length > 0 && (
                        <View style={styles.genresContainer}>
                            {anime.genres.map((genre, index) => (
                                <View key={index} style={styles.genreTag}>
                                    <Text style={styles.genreText}>{genre.name}</Text>
                                </View>
                            ))}
                        </View>
                    )
                }

                {/* Description */}
                {
                    anime.description && (
                        <View style={styles.descriptionSection}>
                            <Text style={styles.sectionTitle}>📝 القصة</Text>
                            <Text style={styles.description}>{anime.description}</Text>
                        </View>
                    )
                }
            </View >

            {/* Episodes List */}
            {
                episodes.length > 0 && (
                    <View style={styles.episodesSection}>
                        <Text style={styles.sectionTitle}>📺 الحلقات ({episodes.length})</Text>
                        {episodes.map((item) => renderEpisode({ item }))}
                    </View>
                )
            }
        </ScrollView >
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
    header: {
        height: 250,
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        padding: 16,
        alignItems: 'flex-end',
    },
    poster: {
        width: 100,
        height: 140,
        borderRadius: 12,
    },
    titleContainer: {
        flex: 1,
        marginLeft: 16,
        marginBottom: 10,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    subtitle: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 4,
        textAlign: 'right',
    },
    metaRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    metaText: {
        color: '#888',
        fontSize: 12,
    },
    infoSection: {
        padding: 16,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
    },
    completed: {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
    },
    ongoing: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    genresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    genreTag: {
        backgroundColor: '#1a1a1b',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    genreText: {
        color: '#e94560',
        fontSize: 12,
    },
    descriptionSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'right',
    },
    description: {
        color: '#aaa',
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'right',
    },
    episodesSection: {
        padding: 16,
        paddingTop: 0,
    },
    episodeCard: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1b',
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden',
    },
    episodeImage: {
        width: 100,
        height: 60,
    },
    episodeInfo: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    episodeNumber: {
        color: '#e94560',
        fontSize: 12,
        fontWeight: '600',
    },
    episodeTitle: {
        color: '#fff',
        fontSize: 14,
        marginTop: 4,
    },
});

export default AnimeDetailScreen;
