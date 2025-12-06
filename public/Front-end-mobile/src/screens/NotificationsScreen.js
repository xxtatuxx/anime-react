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

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const data = await userService.getNotifications();
            const mapped = (data.notifications?.data || []).map((n) => ({
                id: n.id,
                title: n.data?.title || 'إشعار',
                time: n.data?.time || '',
                image: n.data?.image,
                link: n.data?.link,
                read: !!n.read_at,
                type: n.data?.type || 'general',
                episode_id: n.data?.episode_id,
            }));
            setNotifications(mapped);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAllRead = async () => {
        try {
            await userService.markNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}/storage/${path}`;
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'reply': return '💬';
            case 'like': return '❤️';
            case 'episode': return '▶️';
            default: return '🔔';
        }
    };

    const handleNotificationClick = (notif) => {
        if (notif.link) {
            const match = notif.link.match(/episodes\/(\d+)/);
            if (match) {
                navigation.navigate('EpisodePlayer', { episodeId: parseInt(match[1]) });
            }
        } else if (notif.episode_id) {
            navigation.navigate('EpisodePlayer', { episodeId: notif.episode_id });
        }
    };

    const renderNotification = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, !item.read && styles.unread]}
            onPress={() => handleNotificationClick(item)}
        >
            <View style={styles.iconContainer}>
                {item.image ? (
                    <Image
                        source={{ uri: getImageUrl(item.image) }}
                        style={styles.avatar}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.iconBadge}>
                        <Text style={styles.iconText}>{getNotificationIcon(item.type)}</Text>
                    </View>
                )}
            </View>
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.markReadButton} onPress={markAllRead}>
                    <Text style={styles.markReadText}>تحديد الكل كمقروء</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#e94560" style={styles.loader} />
            ) : notifications.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>🔔</Text>
                    <Text style={styles.emptyTitle}>لا توجد إشعارات</Text>
                    <Text style={styles.emptyText}>ستظهر هنا الإشعارات الجديدة</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1b',
    },
    markReadButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(233, 69, 96, 0.3)',
    },
    markReadText: {
        color: '#e94560',
        fontSize: 12,
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
        marginBottom: 10,
        padding: 12,
        alignItems: 'center',
        position: 'relative',
    },
    unread: {
        backgroundColor: 'rgba(233, 69, 96, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(233, 69, 96, 0.2)',
    },
    iconContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 20,
    },
    content: {
        flex: 1,
    },
    title: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 20,
    },
    time: {
        color: '#666',
        fontSize: 11,
        marginTop: 4,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#e94560',
        marginLeft: 10,
    },
});

export default NotificationsScreen;
