import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import AnimeListScreen from '../screens/AnimeListScreen';
import MoviesScreen from '../screens/MoviesScreen';
import EpisodesScreen from '../screens/EpisodesScreen';
import EpisodeDetailScreen from '../screens/EpisodeDetailScreen';
import EpisodePlayerScreen from '../screens/EpisodePlayerScreen';
import AnimeDetailScreen from '../screens/AnimeDetailScreen';
import WatchLaterScreen from '../screens/WatchLaterScreen';
import HistoryScreen from '../screens/HistoryScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icon Component
const TabIcon = ({ name, focused }) => {
    const icons = {
        Home: '🏠',
        Anime: '📺',
        Movies: '🎬',
        Episodes: '▶️',
        Profile: '👤',
    };

    return (
        <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>{icons[name]}</Text>
        </View>
    );
};

// Tab Navigator
const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
                tabBarActiveTintColor: '#e94560',
                tabBarInactiveTintColor: '#888',
                tabBarStyle: {
                    backgroundColor: '#0f0f10',
                    borderTopColor: '#1a1a1b',
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerStyle: {
                    backgroundColor: '#0f0f10',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'الرئيسية' }}
            />
            <Tab.Screen
                name="Anime"
                component={AnimeListScreen}
                options={{ title: 'الأنمي' }}
            />
            <Tab.Screen
                name="Movies"
                component={MoviesScreen}
                options={{ title: 'الأفلام' }}
            />
            <Tab.Screen
                name="Episodes"
                component={EpisodesScreen}
                options={{ title: 'الحلقات' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'حسابي' }}
            />
        </Tab.Navigator>
    );
};

// Main App Navigator
const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#0f0f10',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    contentStyle: {
                        backgroundColor: '#0a0a0b',
                    },
                }}
            >
                <Stack.Screen
                    name="MainTabs"
                    component={TabNavigator}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="EpisodeDetail"
                    component={EpisodeDetailScreen}
                    options={{ title: 'تفاصيل الحلقة' }}
                />
                <Stack.Screen
                    name="EpisodePlayer"
                    component={EpisodePlayerScreen}
                    options={{ title: 'مشاهدة الحلقة', headerShown: false }}
                />
                <Stack.Screen
                    name="AnimeDetail"
                    component={AnimeDetailScreen}
                    options={{ title: 'تفاصيل الأنمي' }}
                />
                <Stack.Screen
                    name="WatchLater"
                    component={WatchLaterScreen}
                    options={{ title: 'المشاهدة لاحقاً' }}
                />
                <Stack.Screen
                    name="History"
                    component={HistoryScreen}
                    options={{ title: 'سجل النشاط' }}
                />
                <Stack.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                    options={{ title: 'الإشعارات' }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ title: 'تسجيل الدخول' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
