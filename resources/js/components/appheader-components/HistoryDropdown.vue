<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue';
import { Link } from '@inertiajs/vue3';
import { History, Loader2, PlayCircle, MessageCircle, Reply, Heart } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import axios from 'axios';

const watchHistory = ref<any[]>([]);
const loadingHistory = ref(false);
const loadingMore = ref(false);
const currentPage = ref(1);
const hasMorePages = ref(true);
const isFirstLoad = ref(true);
const loadMoreTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const fetchHistory = async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
        loadingHistory.value = true;
    } else {
        loadingMore.value = true;
    }
    
    try {
        const response = await axios.get(`/history?page=${page}`);
        const newItems = Array.isArray(response.data) ? response.data : (response.data.data || []);
        
        if (append) {
            watchHistory.value = [...watchHistory.value, ...newItems];
        } else {
            watchHistory.value = newItems;
        }
        
        // Check if there are more pages
        if (response.data.last_page) {
            hasMorePages.value = page < response.data.last_page;
        } else {
            hasMorePages.value = newItems.length >= 20;
        }
        
        currentPage.value = page;
        isFirstLoad.value = false;
    } catch (error) {
        console.error('Failed to fetch history:', error);
    } finally {
        loadingHistory.value = false;
        loadingMore.value = false;
    }
};

const loadMore = () => {
    if (!loadingMore.value && hasMorePages.value) {
        fetchHistory(currentPage.value + 1, true);
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

const handleOpenHistory = (isOpen: boolean) => {
    if (isOpen) {
        // Reset state and clear data when opening
        watchHistory.value = [];
        currentPage.value = 1;
        hasMorePages.value = true;
        isFirstLoad.value = true;
        fetchHistory(1, false);
        
        nextTick(() => {
            setupIntersectionObserver();
        });
    } else {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }
};

const getActionIcon = (type: string) => {
    switch (type) {
        case 'comment': return MessageCircle;
        case 'reply': return Reply;
        case 'like': return Heart;
        default: return PlayCircle;
    }
};

const getActionColor = (type: string) => {
    switch (type) {
        case 'comment': return 'text-blue-500';
        case 'reply': return 'text-green-500';
        case 'like': return 'text-red-500';
        default: return 'text-indigo-500';
    }
};

const getActionDescription = (item: any) => {
    const episodeInfo = `الحلقة ${item.episode_number}`;
    switch (item.type) {
        case 'comment':
            return `علّقت: "${item.metadata?.content || '...'}"`;
        case 'reply':
            return `رددت على ${item.metadata?.replied_to_user || 'مستخدم'}: "${item.metadata?.content || '...'}"`;
        case 'like':
            return `أعجبت بتعليق ${item.metadata?.comment_owner || 'مستخدم'}: "${item.metadata?.comment_content || '...'}"`;
        default:
            return `شاهدت ${episodeInfo}`;
    }
};

const navigateToEpisode = (episodeId: number) => {
    window.location.href = `/Front-end-react/dist/index.html#/episodes/${episodeId}`;
};

onUnmounted(() => {
    if (observer) {
        observer.disconnect();
    }
});
</script>

<template>
  <DropdownMenu @update:open="handleOpenHistory">
      <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" class="w-12 h-12 text-gray-700 rounded-full dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
              <History class="w-8 h-8" />
          </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" class="w-80 md:w-96 p-0 bg-white dark:bg-[#111] border-gray-100 dark:border-neutral-800 shadow-2xl rounded-2xl">
           <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 class="font-bold text-gray-900 dark:text-white">سجل النشاط</h3>
              <Link href="/history/page" class="text-xs text-indigo-600 hover:underline dark:text-indigo-400">عرض السجل بالكامل</Link>
          </div>

          <div class="max-h-[400px] overflow-y-auto min-h-[150px]">
              <div v-if="loadingHistory && isFirstLoad" class="flex items-center justify-center h-40">
                   <Loader2 class="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
              <div v-else-if="watchHistory.length === 0 && !loadingHistory" class="flex flex-col items-center justify-center h-40 gap-2 text-gray-500">
                  <History class="w-8 h-8 opacity-20" />
                  <span class="text-sm">لم تقم بأي نشاط مؤخراً</span>
              </div>
              <div v-else class="p-2 space-y-1">
                  <div v-for="item in watchHistory" :key="item.id" @click="navigateToEpisode(item.episode_id)" class="flex gap-3 p-2 transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-900 group cursor-pointer">
                       <div class="relative h-16 overflow-hidden bg-gray-200 rounded-lg shrink-0 w-24 dark:bg-neutral-800">
                          <img :src="item.image" class="object-cover w-full h-full" />
                          <div class="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 bg-black/40">
                              <component :is="getActionIcon(item.type)" class="w-6 h-6" :class="getActionColor(item.type)" />
                          </div>
                      </div>
                      <div class="flex flex-col justify-center flex-1 min-w-0 gap-0.5">
                          <div class="flex items-center gap-2">
                              <component :is="getActionIcon(item.type)" class="w-4 h-4 shrink-0" :class="getActionColor(item.type)" />
                              <span class="text-sm font-semibold text-gray-800 truncate dark:text-gray-200">{{ item.series_title }}</span>
                          </div>
                          <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2" dir="rtl">{{ getActionDescription(item) }}</p>
                          <div class="flex items-center justify-between text-[10px] text-gray-400 mt-0.5">
                              <span>الحلقة {{ item.episode_number }}</span>
                              <span>{{ item.created_at }}</span>
                          </div>
                      </div>
                  </div>
                  
                  <!-- Load More Trigger -->
                  <div ref="loadMoreTrigger" class="flex items-center justify-center py-3">
                      <Loader2 v-if="loadingMore" class="w-5 h-5 text-indigo-500 animate-spin" />
                      <span v-else-if="!hasMorePages && watchHistory.length > 0" class="text-xs text-gray-400">لا توجد أنشطة أخرى</span>
                  </div>
              </div>
          </div>
      </DropdownMenuContent>
  </DropdownMenu>
</template>

