<script setup lang="ts">
import { ref } from 'vue';

import { Link, router } from '@inertiajs/vue3';
import { Bell, Trash2, CheckCheck, ThumbsUp, ThumbsDown, MessageCircle, Play } from 'lucide-vue-next';
import AppLayout from '@/layouts/AR-HomeLayout.vue';

import axios from 'axios';

const props = defineProps<{
    notifications: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    unread_count: number;
}>();

const getNotificationIcon = (notif: any) => {
    const type = notif.data?.type;
    switch (type) {
        case 'reply': return MessageCircle;
        case 'like': return notif.data?.is_like ? ThumbsUp : ThumbsDown;
        case 'episode': return Play;
        default: return Bell;
    }
};

const getNotificationIconColor = (notif: any) => {
    const type = notif.data?.type;
    switch (type) {
        case 'reply': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
        case 'like': return notif.data?.is_like ? 'text-red-500 bg-red-100 dark:bg-red-900/30' : 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
        case 'episode': return 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30';
        default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
    }
};

const markAllAsRead = async () => {
    try {
        await axios.post('/notifications/mark-as-read');
        router.reload();
    } catch (e) {
        console.error(e);
    }
};

const clearAllNotifications = async () => {
    if (confirm('هل أنت متأكد من حذف كل الإشعارات؟')) {
        try {
            await axios.delete('/notifications/clear-all');
            router.reload();
        } catch (e) {
            console.error(e);
        }
    }
};

const deleteNotification = async (id: string, event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
        await axios.delete(`/notifications/${id}`);
        router.reload();
    } catch (e) {
        console.error(e);
    }
};

const handleNotificationClick = (notif: any) => {
    if (notif.data?.link) {
        router.visit(notif.data.link);
    }
};
</script>

<template>
    <AppLayout>
        <div class="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-8">
            <div class="container px-4 mx-auto max-w-4xl">
                <!-- Header -->
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center w-12 h-12 text-indigo-600 bg-indigo-100 rounded-xl dark:bg-indigo-900/30 dark:text-indigo-400">
                            <Bell class="w-6 h-6" />
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">الإشعارات</h1>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                {{ unread_count > 0 ? `${unread_count} إشعار غير مقروء` : 'كل الإشعارات مقروءة' }}
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button @click="markAllAsRead" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors bg-indigo-50 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
                            <CheckCheck class="w-4 h-4" />
                            تحديد الكل كمقروء
                        </button>
                        <button @click="clearAllNotifications" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 transition-colors bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
                            <Trash2 class="w-4 h-4" />
                            حذف الكل
                        </button>
                    </div>
                </div>

                <!-- Notifications List -->
                <div v-if="notifications.data.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500 bg-white border border-gray-100 rounded-2xl dark:bg-neutral-900 dark:border-neutral-800">
                    <Bell class="w-16 h-16 mb-4 opacity-20" />
                    <p class="text-lg font-medium">لا توجد إشعارات</p>
                    <p class="text-sm">ستظهر هنا الإشعارات الجديدة</p>
                </div>

                <div v-else class="overflow-hidden bg-white border border-gray-100 rounded-2xl dark:bg-neutral-900 dark:border-neutral-800">
                    <div v-for="(notif, index) in notifications.data" :key="notif.id" 
                         @click="handleNotificationClick(notif)"
                         class="relative flex gap-4 p-5 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/50 group"
                         :class="[
                             !notif.read_at ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : '',
                             index !== notifications.data.length - 1 ? 'border-b border-gray-100 dark:border-neutral-800' : ''
                         ]">
                        
                        <!-- Icon/Avatar -->
                        <div class="relative shrink-0">
                            <div v-if="notif.data?.image" class="w-14 h-14 overflow-hidden border border-gray-100 rounded-full dark:border-neutral-700">
                                <img :src="notif.data.image.startsWith('http') ? notif.data.image : `/storage/${notif.data.image}`" class="object-cover w-full h-full" />
                            </div>
                            <div v-else class="flex items-center justify-center w-14 h-14 rounded-full" :class="getNotificationIconColor(notif)">
                                <component :is="getNotificationIcon(notif)" class="w-6 h-6" />
                            </div>
                            <!-- Small icon badge -->
                            <div class="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full border-2 border-white dark:border-[#111]" :class="getNotificationIconColor(notif)">
                                <component :is="getNotificationIcon(notif)" class="w-3 h-3" />
                            </div>
                        </div>

                        <!-- Content -->
                        <div class="flex flex-col flex-1 min-w-0 gap-2">
                            <p class="text-base font-semibold leading-snug text-gray-900 dark:text-gray-100">
                                {{ notif.data?.title }}
                            </p>
                            
                            <!-- Reply content -->
                            <div v-if="notif.data?.type === 'reply'" class="space-y-1">
                                <p class="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 rounded-lg px-3 py-2 line-clamp-2" dir="rtl">
                                    "{{ notif.data?.reply_content }}"
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1" dir="rtl">
                                    <span class="font-medium">تعليقك:</span> {{ notif.data?.original_comment }}
                                </p>
                            </div>
                            
                            <!-- Like content -->
                            <div v-else-if="notif.data?.type === 'like'" class="space-y-1">
                                <p class="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 rounded-lg px-3 py-2 line-clamp-2" dir="rtl">
                                    "{{ notif.data?.comment_content }}"
                                </p>
                            </div>
                            
                            <span class="text-sm text-gray-500 dark:text-gray-400">{{ notif.data?.time }}</span>
                        </div>

                        <!-- Unread indicator -->
                        <div v-if="!notif.read_at" class="absolute w-3 h-3 bg-indigo-500 rounded-full top-6 left-4"></div>
                        
                        <!-- Delete Button -->
                        <button @click="deleteNotification(notif.id, $event)" 
                                class="absolute p-2 text-gray-400 transition-all rounded-full opacity-0 top-4 left-4 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 group-hover:opacity-100">
                            <Trash2 class="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="notifications.last_page > 1" class="flex justify-center gap-2 mt-8">
                    <Link v-for="link in notifications.links" :key="link.label" :href="link.url || '#'"
                          class="px-4 py-2 text-sm font-medium transition-colors rounded-lg"
                          :class="link.active ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700'"
                          v-html="link.label">
                    </Link>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
