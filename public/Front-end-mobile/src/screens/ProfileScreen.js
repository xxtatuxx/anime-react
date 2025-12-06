import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
    const { user, isAuthenticated, logout } = useAuth();

    const menuItems = [
        { icon: '🕐', title: 'المشاهدة لاحقاً', screen: 'WatchLater' },
        { icon: '📜', title: 'سجل النشاط', screen: 'History' },
        { icon: '🔔', title: 'الإشعارات', screen: 'Notifications' },
    ];

    const handleLogout = async () => {
        await logout();
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* User Info */}
            <View style={styles.userSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {isAuthenticated ? user?.name?.charAt(0)?.toUpperCase() || '👤' : '👤'}
                    </Text>
                </View>
                {isAuthenticated ? (
                    <>
                        <Text style={styles.userName}>{user?.name || 'المستخدم'}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.userName}>الزائر</Text>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Menu Items */}
            {isAuthenticated && (
                <View style={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={() => navigation.navigate(item.screen)}
                        >
                            <Text style={styles.menuIcon}>{item.icon}</Text>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuArrow}>←</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Logout Button */}
            {isAuthenticated && (
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>🚪 تسجيل الخروج</Text>
                </TouchableOpacity>
            )}

            {/* App Info */}
            <View style={styles.appInfo}>
                <Text style={styles.appName}>🎌 أنمي لاست</Text>
                <Text style={styles.appVersion}>الإصدار 1.0.0</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0b',
    },
    userSection: {
        alignItems: 'center',
        padding: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1b',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e94560',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
    },
    userName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    userEmail: {
        color: '#888',
        fontSize: 14,
        marginTop: 4,
    },
    loginButton: {
        marginTop: 16,
        backgroundColor: '#e94560',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 10,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    menuSection: {
        padding: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1b',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    menuIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    menuTitle: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    menuArrow: {
        color: '#888',
        fontSize: 20,
    },
    logoutButton: {
        margin: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
    appInfo: {
        alignItems: 'center',
        padding: 30,
        marginTop: 20,
    },
    appName: {
        color: '#888',
        fontSize: 16,
        fontWeight: '600',
    },
    appVersion: {
        color: '#555',
        fontSize: 12,
        marginTop: 4,
    },
});

export default ProfileScreen;
