<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue';
import { Link } from '@inertiajs/vue3';
import { Clock, Loader2, X } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import axios from 'axios';

const watchLater = ref<any[]>([]);
const loadingWatchLater = ref(false);
const loadingMore = ref(false);
const currentPage = ref(1);
const hasMorePages = ref(true);
const isFirstLoad = ref(true);
const loadMoreTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const fetchWatchLater = async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
        loadingWatchLater.value = true;
    } else {
        loadingMore.value = true;
    }
    
    try {
        const response = await axios.get(`/watch-later?page=${page}`);
        const newItems = Array.isArray(response.data) ? response.data : (response.data.data || []);
        
        if (append) {
            watchLater.value = [...watchLater.value, ...newItems];
        } else {
            watchLater.value = newItems;
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
        console.error('Failed to fetch watch later', error);
    } finally {
        loadingWatchLater.value = false;
        loadingMore.value = false;
    }
};

const loadMore = () => {
    if (!loadingMore.value && hasMorePages.value) {
        fetchWatchLater(currentPage.value + 1, true);
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

const removeFromWatchLater = async (episodeId: number) => {
    try {
        await axios.delete(`/watch-later/${episodeId}`);
        watchLater.value = watchLater.value.filter(item => item.id !== episodeId);
    } catch (error) {
        console.error('Failed to remove from watch later', error);
    }
};

const handleOpenWatchLater = (isOpen: boolean) => {
    if (isOpen) {
        // Reset state and clear data when opening
        watchLater.value = [];
        currentPage.value = 1;
        hasMorePages.value = true;
        isFirstLoad.value = true;
        fetchWatchLater(1, false);
        
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
  <DropdownMenu @update:open="handleOpenWatchLater">
      <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" class="w-12 h-12 text-gray-700 rounded-full dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
              <Clock class="w-8 h-8" />
          </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent  align="end" class="w-80 md:w-96 p-0 bg-white dark:bg-[#111] border-gray-100 dark:border-neutral-800 shadow-2xl rounded-2xl">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 class="font-bold text-gray-900 dark:text-white">المشاهدة لاحقاً</h3>
              <Link href="/watch-later/page" class="text-xs text-indigo-600 hover:underline dark:text-indigo-400">عرض الكل</Link>
          </div>
          
          <div class="max-h-[350px] overflow-y-auto min-h-[150px]">
              <div v-if="loadingWatchLater && isFirstLoad" class="flex items-center justify-center h-40">
                   <Loader2 class="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
              <div v-else-if="watchLater.length === 0 && !loadingWatchLater" class="flex flex-col items-center justify-center h-40 gap-2 text-gray-500">
                  <Clock class="w-8 h-8 opacity-20" />
                  <span class="text-sm">القائمة فارغة</span>
              </div>
              <div v-else class="p-2 space-y-1">
                  <div v-for="item in watchLater" :key="item.id" class="relative flex gap-3 p-2 transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-900 group">
                      <div @click="navigateToEpisode(item.id)" class="flex gap-3 flex-1 min-w-0 cursor-pointer">
                        <div class="relative w-24 overflow-hidden rounded-lg shrink-0 h-14 bg-gray-200 dark:bg-[#222]">
                            <img :src="item.image" class="object-cover w-full h-full" />
                        </div>
                        <div class="flex flex-col justify-center flex-1 min-w-0">
                            <span class="text-sm font-semibold text-gray-800 truncate dark:text-gray-200">{{ item.episode_number }} - {{ item.title }}</span>
                            <span class="text-xs text-gray-500">{{ item.series_title }}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        @click.stop="removeFromWatchLater(item.id)"
                        class="absolute w-6 h-6 transition-opacity rounded-full opacity-0 left-2 top-2 group-hover:opacity-100 bg-white/80 dark:bg-black/80 hover:bg-red-500 hover:text-white"
                      >
                          <X class="w-3 h-3" />
                      </Button>
                  </div>
                  
                  <!-- Load More Trigger -->
                  <div ref="loadMoreTrigger" class="flex items-center justify-center py-3">
                      <Loader2 v-if="loadingMore" class="w-5 h-5 text-indigo-500 animate-spin" />
                      <span v-else-if="!hasMorePages && watchLater.length > 0" class="text-xs text-gray-400">لا توجد حلقات أخرى</span>
                  </div>
              </div>
          </div>
      </DropdownMenuContent>
  </DropdownMenu>
</template>

