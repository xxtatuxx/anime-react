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
} from 'react-native';
import { userService, API_BASE_URL } from '../services/api';

const WatchLaterScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWatchLater = async () => {
        try {
            const data = await userService.getWatchLater();
            setItems(data.data || []);
        } catch (error) {
            console.error('Failed to fetch watch later:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWatchLater();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWatchLater();
    };

    const removeItem = async (episodeId) => {
        try {
            await userService.removeWatchLater(episodeId);
            setItems(prev => prev.filter(item => item.id !== episodeId));
        } catch (error) {
            console.error('Failed to remove:', error);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/160x90';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}/storage/${path}`;
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('EpisodePlayer', { episodeId: item.id })}
        >
            <Image
                source={{ uri: getImageUrl(item.image) }}
                style={styles.cardImage}
                resizeMode="cover"
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    الحلقة {item.episode_number} - {item.title}
                </Text>
                <Text style={styles.cardSeries} numberOfLines={1}>
                    {item.series_title}
                </Text>
                <Text style={styles.cardTime}>أُضيف {item.added_at}</Text>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
            >
                <Text style={styles.removeIcon}>✕</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#e94560" style={styles.loader} />
            ) : items.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>🕐</Text>
                    <Text style={styles.emptyTitle}>القائمة فارغة</Text>
                    <Text style={styles.emptyText}>لم تضف أي حلقات للمشاهدة لاحقاً</Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
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
        padding: 40,
    },
    emptyIcon: {
        fontSize: 64,
        opacity: 0.3,
        marginBottom: 16,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1b',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    cardImage: {
        width: 120,
        height: 80,
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    cardTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    cardSeries: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
    },
    cardTime: {
        color: '#666',
        fontSize: 10,
        marginTop: 4,
    },
    removeButton: {
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeIcon: {
        color: '#ef4444',
        fontSize: 16,
    },
});

export default WatchLaterScreen;
