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

const AnimeListScreen = ({ navigation }) => {
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchAnime = async (pageNum = 1, refresh = false) => {
        try {
            const data = await homeService.getAnime({ page: pageNum });
            const newAnime = data.series?.data || [];

            if (refresh) {
                setAnimeList(newAnime);
            } else {
                setAnimeList(prev => [...prev, ...newAnime]);
            }

            setHasMore(data.series?.current_page < data.series?.last_page);
        } catch (error) {
            console.error('Failed to fetch anime:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnime();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchAnime(1, true);
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchAnime(nextPage);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/300x400';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}/storage/${path}`;
    };

    const renderAnime = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AnimeDetail', { animeId: item.id })}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: getImageUrl(item.poster_image) }}
                style={styles.cardImage}
                resizeMode="cover"
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.arabic_title || item.title}
                </Text>
                <View style={styles.cardMeta}>
                    <Text style={styles.metaText}>📅 {item.release_year}</Text>
                    <Text style={styles.metaText}>📺 {item.episodes_count || 0}</Text>
                </View>
                {item.status && (
                    <View style={[
                        styles.statusBadge,
                        item.status === 'مكتمل' ? styles.completed : styles.ongoing
                    ]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading && page === 1 ? (
                <ActivityIndicator size="large" color="#e94560" style={styles.loader} />
            ) : (
                <FlatList
                    data={animeList}
                    renderItem={renderAnime}
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
        height: 180,
    },
    cardContent: {
        padding: 10,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
        minHeight: 36,
    },
    cardMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    metaText: {
        color: '#888',
        fontSize: 11,
    },
    statusBadge: {
        marginTop: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    completed: {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
    },
    ongoing: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
});

export default AnimeListScreen;
