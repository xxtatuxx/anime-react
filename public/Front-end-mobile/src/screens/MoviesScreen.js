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

const MoviesScreen = ({ navigation }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMovies = async () => {
        try {
            const data = await homeService.getMovies();
            setMovies(data.movies?.data || []);
        } catch (error) {
            console.error('Failed to fetch movies:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMovies();
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/300x400';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}/storage/${path}`;
    };

    const renderMovie = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('EpisodeDetail', { episodeId: item.id })}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: getImageUrl(item.poster_image || item.image) }}
                style={styles.cardImage}
                resizeMode="cover"
            />
            <View style={styles.cardOverlay}>
                <Text style={styles.movieBadge}>🎬 فيلم</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.arabic_title || item.title}
                </Text>
                {item.duration && (
                    <Text style={styles.duration}>⏱ {item.duration} دقيقة</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#e94560" style={styles.loader} />
            ) : movies.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>🎬</Text>
                    <Text style={styles.emptyText}>لا توجد أفلام حالياً</Text>
                </View>
            ) : (
                <FlatList
                    data={movies}
                    renderItem={renderMovie}
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
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
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
        height: 200,
    },
    cardOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    movieBadge: {
        backgroundColor: 'rgba(147, 51, 234, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
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
    duration: {
        color: '#888',
        fontSize: 12,
        marginTop: 6,
        textAlign: 'right',
    },
});

export default MoviesScreen;
