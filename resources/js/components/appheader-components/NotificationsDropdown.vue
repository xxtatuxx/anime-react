<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue';
import { Bell, Loader2, MoreVertical, Trash2, Heart, MessageCircle, ThumbsUp, ThumbsDown, Play } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import axios from 'axios';
import { router, Link } from '@inertiajs/vue3';

const notifications = ref<any[]>([]);
const unreadCount = ref(0);
const loadingNotifications = ref(false);
const loadingMore = ref(false);
const currentPage = ref(1);
const hasMorePages = ref(true);
const isFirstLoad = ref(true);
const scrollContainer = ref<HTMLElement | null>(null);
const loadMoreTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const mapNotification = (n: any) => {
    return {
        id: n.id,
        title: n.data.title,
        time: n.data.time,
        image: n.data.image,
        link: n.data.link,
        read: !!n.read_at,
        type: n.data.type,
        duration: n.data.duration,
        replier_name: n.data.replier_name,
        reply_content: n.data.reply_content,
        original_comment: n.data.original_comment,
        liker_name: n.data.liker_name,
        is_like: n.data.is_like,
        comment_content: n.data.comment_content,
    };
};

const fetchNotifications = async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
        loadingNotifications.value = true;
    } else {
        loadingMore.value = true;
    }
    
    try {
        const res = await axios.get(`/notifications?page=${page}`);
        const newNotifications = res.data.notifications.data 
            ? res.data.notifications.data.map(mapNotification)
            : res.data.notifications.map(mapNotification);
        
        if (append) {
            notifications.value = [...notifications.value, ...newNotifications];
        } else {
            notifications.value = newNotifications;
        }
        
        unreadCount.value = res.data.unread_count;
        
        // Check if there are more pages
        if (res.data.notifications.last_page) {
            hasMorePages.value = page < res.data.notifications.last_page;
        } else {
            // For non-paginated response, assume no more if less than 20 items
            hasMorePages.value = newNotifications.length >= 20;
        }
        
        currentPage.value = page;
        isFirstLoad.value = false;
    } catch (e) {
        console.error('Failed to fetch notifications:', e);
    } finally {
        loadingNotifications.value = false;
        loadingMore.value = false;
    }
};

const loadMore = () => {
    if (!loadingMore.value && hasMorePages.value) {
        fetchNotifications(currentPage.value + 1, true);
    }
};

const setupIntersectionObserver = () => {
    if (observer) observer.disconnect();
    
    nextTick(() => {
        if (loadMoreTrigger.value) {
            observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && !loadingMore.value && hasMorePages.value) {
                        loadMore();
                    }
                },
                { threshold: 0.1 }
            );
            observer.observe(loadMoreTrigger.value);
        }
    });
};

const handleOpenNotifications = (isOpen: boolean) => {
    if (isOpen) {
        // Reset state and clear data when opening
        notifications.value = [];
        currentPage.value = 1;
        hasMorePages.value = true;
        isFirstLoad.value = true;
        fetchNotifications(1, false);
        
        // Setup observer after content loads
        nextTick(() => {
            setupIntersectionObserver();
        });
    } else {
        // Cleanup observer when closing
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }
};

const markAsRead = async () => {
    try {
        await axios.post('/notifications/mark-as-read');
        unreadCount.value = 0;
        notifications.value.forEach(n => n.read = true);
    } catch (e) {
        console.error(e);
    }
};

const clearAllNotifications = async () => {
    try {
        await axios.delete('/notifications/clear-all');
        notifications.value = [];
        unreadCount.value = 0;
    } catch (e) {
        console.error(e);
    }
};

const deleteNotification = async (id: string, event: Event) => {
    event.stopPropagation();
    try {
        await axios.delete(`/notifications/${id}`);
        notifications.value = notifications.value.filter(n => n.id !== id);
    } catch (e) {
        console.error(e);
    }
};

const handleNotificationClick = (notif: any) => {
    if (notif.link) {
        // Use window.location for React links
        window.location.href = notif.link;
    }
};

const getNotificationIcon = (notif: any) => {
    switch (notif.type) {
        case 'reply': return MessageCircle;
        case 'like': return notif.is_like ? ThumbsUp : ThumbsDown;
        case 'episode': return Play;
        default: return Bell;
    }
};

const getNotificationIconColor = (notif: any) => {
    switch (notif.type) {
        case 'reply': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
        case 'like': return notif.is_like ? 'text-red-500 bg-red-100 dark:bg-red-900/30' : 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
        case 'episode': return 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30';
        default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
    }
};

onUnmounted(() => {
    if (observer) {
        observer.disconnect();
    }
});
</script>

<template>
  <DropdownMenu @update:open="handleOpenNotifications">
      <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" type="button" class="relative w-12 h-12 text-gray-700 rounded-full dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
              <Bell class="w-8 h-8" />
              <span v-if="unreadCount > 0" class="absolute top-2 right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full border-2 border-white dark:border-[#111]">
                  {{ unreadCount > 9 ? '+9' : unreadCount }}
              </span>
          </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" class="w-[380px] md:w-[450px] p-0 bg-white dark:bg-[#111] border-gray-100 dark:border-neutral-800 shadow-2xl rounded-2xl">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 class="font-bold text-gray-900 dark:text-white">الإشعارات</h3>
              <div class="flex gap-2 items-center">
                  <Link href="/notifications/page" class="text-xs text-indigo-600 hover:underline dark:text-indigo-400">عرض الكل</Link>
                  <button type="button" @click="markAsRead" class="text-xs text-indigo-600 hover:underline dark:text-indigo-400">تحديد الكل كمقروء</button>
                  <button type="button" @click="clearAllNotifications" class="p-1 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20" title="حذف جميع الإشعارات">
                      <Trash2 class="w-4 h-4" />
                  </button>
              </div>
          </div>

          <div ref="scrollContainer" class="max-h-[450px] overflow-y-auto min-h-[200px] custom-scrollbar">
              <div v-if="loadingNotifications && isFirstLoad" class="flex items-center justify-center h-40">
                   <Loader2 class="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
              <div v-else-if="notifications.length === 0 && !loadingNotifications" class="flex flex-col items-center justify-center h-40 gap-2 text-gray-500">
                  <Bell class="w-8 h-8 opacity-20" />
                  <span class="text-sm">لا توجد إشعارات جديدة</span>
              </div>
              <div v-else class="py-2">
                  <div v-for="notif in notifications" :key="notif.id" 
                       @click="handleNotificationClick(notif)"
                       class="relative flex gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-900/50 group"
                       :class="{'bg-indigo-50/50 dark:bg-indigo-900/10': !notif.read}">
                      
                      <div class="shrink-0">
                          <!-- Episode Notification: Rectangular Image with Duration -->
                          <div v-if="notif.type === 'episode'" class="relative w-24 h-16 overflow-hidden border border-gray-100 rounded-md dark:border-neutral-800">
                              <img :src="notif.image && notif.image.startsWith('http') ? notif.image : `/storage/${notif.image}`" class="object-cover w-full h-full" />
                              <div v-if="notif.duration" class="absolute bottom-1 right-1 px-1 py-0.5 text-[10px] font-bold text-white bg-black/70 rounded">
                                  {{ notif.duration }} د
                              </div>
                          </div>
                          
                          <!-- Other Notifications: Icon + Avatar -->
                          <div v-else class="relative">
                              <div v-if="notif.image" class="w-12 h-12 overflow-hidden border border-gray-100 rounded-full dark:border-neutral-800">
                                  <img :src="notif.image.startsWith('http') ? notif.image : `/storage/${notif.image}`" class="object-cover w-full h-full" />
                              </div>
                              <div v-else class="flex items-center justify-center w-12 h-12 rounded-full" :class="getNotificationIconColor(notif)">
                                  <component :is="getNotificationIcon(notif)" class="w-5 h-5" />
                              </div>
                              <!-- Small icon badge -->
                              <div class="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full border-2 border-white dark:border-[#111]" :class="getNotificationIconColor(notif)">
                                  <component :is="getNotificationIcon(notif)" class="w-3 h-3" />
                              </div>
                          </div>
                      </div>

                      <div class="flex flex-col flex-1 min-w-0 gap-1">
                          <!-- Notification Title -->
                          <p class="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                              {{ notif.title }}
                          </p>
                          
                          <!-- Reply Notification: Show reply content and original comment -->
                          <div v-if="notif.type === 'reply'" class="space-y-1">
                              <p class="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 rounded-lg px-2 py-1.5 line-clamp-2" dir="rtl">
                                  "{{ notif.reply_content }}"
                              </p>
                              <p class="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1" dir="rtl">
                                  <span class="font-medium">تعليقك:</span> {{ notif.original_comment }}
                              </p>
                          </div>
                          
                          <!-- Like Notification: Show liked comment content -->
                          <div v-else-if="notif.type === 'like'" class="space-y-1">
                              <p class="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 rounded-lg px-2 py-1.5 line-clamp-2" dir="rtl">
                                  "{{ notif.comment_content }}"
                              </p>
                          </div>
                          
                          <span class="text-xs text-gray-500 dark:text-gray-400">{{ notif.time }}</span>
                      </div>

                      <div v-if="!notif.read" class="absolute w-2 h-2 -translate-y-1/2 bg-indigo-500 rounded-full top-1/2 left-2"></div>
                      
                      <!-- Delete Button (Visible on Hover) -->
                      <button type="button" @click="deleteNotification(notif.id, $event)" class="absolute p-1 text-gray-400 transition-opacity opacity-0 top-2 left-2 hover:text-red-500 group-hover:opacity-100">
                          <Trash2 class="w-4 h-4" />
                      </button>
                  </div>
                  
                  <!-- Load More Trigger -->
                  <div ref="loadMoreTrigger" class="flex items-center justify-center py-3">
                      <Loader2 v-if="loadingMore" class="w-5 h-5 text-indigo-500 animate-spin" />
                      <span v-else-if="!hasMorePages && notifications.length > 0" class="text-xs text-gray-400">لا توجد إشعارات أخرى</span>
                  </div>
              </div>
          </div>
      </DropdownMenuContent>
  </DropdownMenu>
</template>

