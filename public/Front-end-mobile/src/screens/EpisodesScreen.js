import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { homeService, API_BASE_URL } from '../services/api';

const { width } = Dimensions.get('window');

const EpisodesScreen = ({ navigation }) => {
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchEpisodes = async (pageNum = 1, refresh = false) => {
        try {
            const data = await homeService.getEpisodes(pageNum);
            const newEpisodes = data.episodes?.data || [];

            if (refresh) {
                setEpisodes(newEpisodes);
            } else {
                setEpisodes(prev => [...prev, ...newEpisodes]);
            }

            setHasMore(data.episodes?.current_page < data.episodes?.last_page);
        } catch (error) {
            console.error('Failed to fetch episodes:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEpisodes();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchEpisodes(1, true);
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchEpisodes(nextPage);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/300x200';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}/storage/${path}`;
    };

    const renderEpisode = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('EpisodeDetail', { episodeId: item.id })}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: getImageUrl(item.image) }}
                style={styles.cardImage}
                resizeMode="cover"
            />
            <View style={styles.cardOverlay}>
                <Text style={styles.episodeNumber}>الحلقة {item.episode_number}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.series?.arabic_title || item.title}
                </Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.cardTime}>
                    {item.created_at_human || item.created_at}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading && page === 1 ? (
                <ActivityIndicator size="large" color="#e94560" style={styles.loader} />
            ) : (
                <FlatList
                    data={episodes}
                    renderItem={renderEpisode}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#e94560']}
                            tintColor="#e94560"
                        />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loading && page > 1 ? (
                            <ActivityIndicator size="small" color="#e94560" style={{ padding: 20 }} />
                        ) : null
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
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
    },
    listContent: {
        padding: 10,
        paddingBottom: 20,
    },
    row: {
        justifyContent: 'space-between',
    },
    card: {
        width: (width - 40) / 2,
        backgroundColor: '#1a1a1b',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 120,
    },
    cardOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(233, 69, 96, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    episodeNumber: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 10,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
    },
    cardSubtitle: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'right',
    },
    cardTime: {
        color: '#666',
        fontSize: 10,
        marginTop: 4,
        textAlign: 'right',
    },
});

export default EpisodesScreen;
