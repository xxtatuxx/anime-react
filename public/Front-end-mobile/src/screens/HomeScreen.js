import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { homeService, API_BASE_URL } from '../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        try {
            const data = await homeService.getHome(search);
            console.log('[HomeScreen] API response:', data);
            // latestEpisodes is a paginated object with .data array
            const episodesData = data.latestEpisodes?.data || data.latestEpisodes || [];
            console.log('[HomeScreen] Episodes count:', episodesData.length);
            setEpisodes(episodesData);
        } catch (error) {
            console.error('Failed to fetch home:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleSearch = () => {
        setLoading(true);
        fetchData();
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
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="ابحث عن أنمي..."
                    placeholderTextColor="#666"
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchIcon}>🔍</Text>
                </TouchableOpacity>
            </View>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🎌 آخر الحلقات</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Episodes')}>
                    <Text style={styles.viewAll}>عرض الكل</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
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
    searchContainer: {
        flexDirection: 'row',
        padding: 15,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#1a1a1b',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 16,
        textAlign: 'right',
    },
    searchButton: {
        backgroundColor: '#e94560',
        borderRadius: 12,
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchIcon: {
        fontSize: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    viewAll: {
        color: '#e94560',
        fontSize: 14,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 10,
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
});

export default HomeScreen;
