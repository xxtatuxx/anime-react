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

const HistoryScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = async () => {
        try {
            const data = await userService.getHistory();
            setItems(data.data || []);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/120x80';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}/storage/${path}`;
    };

    const getActionIcon = (type) => {
        switch (type) {
            case 'comment': return '💬';
            case 'reply': return '↩️';
            case 'like': return '❤️';
            default: return '▶️';
        }
    };

    const getActionDescription = (item) => {
        switch (item.type) {
            case 'comment':
                return `علّقت: "${item.metadata?.content || '...'}"`;
            case 'reply':
                return `رددت على ${item.metadata?.replied_to_user || 'مستخدم'}`;
            case 'like':
                return `أعجبت بتعليق ${item.metadata?.comment_owner || 'مستخدم'}`;
            default:
                return `شاهدت الحلقة ${item.episode_number}`;
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('EpisodePlayer', { episodeId: item.episode_id })}
        >
            <View style={styles.cardThumb}>
                <Image
                    source={{ uri: getImageUrl(item.image) }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <View style={styles.iconBadge}>
                    <Text style={styles.iconText}>{getActionIcon(item.type)}</Text>
                </View>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                    <Text style={styles.actionIcon}>{getActionIcon(item.type)}</Text>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.series_title}</Text>
                </View>
                <Text style={styles.cardDescription} numberOfLines={2}>
                    {getActionDescription(item)}
                </Text>
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>الحلقة {item.episode_number}</Text>
                    <Text style={styles.metaText}>{item.created_at}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#e94560" style={styles.loader} />
            ) : items.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>📜</Text>
                    <Text style={styles.emptyTitle}>السجل فارغ</Text>
                    <Text style={styles.emptyText}>لم تقم بأي نشاط مؤخراً</Text>
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
    cardThumb: {
        position: 'relative',
        width: 100,
        height: 70,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    iconBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 12,
    },
    cardContent: {
        flex: 1,
        padding: 10,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionIcon: {
        fontSize: 14,
    },
    cardTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    cardDescription: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
        lineHeight: 18,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    metaText: {
        color: '#666',
        fontSize: 10,
    },
});

export default HistoryScreen;
