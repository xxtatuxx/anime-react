<script setup lang="ts">
import { ref } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import { Clock, Play, Trash2, ArrowRight } from 'lucide-vue-next';
import AppLayout from '@/layouts/AR-HomeLayout.vue';
import axios from 'axios';

const props = defineProps<{
    watchLater: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
    };
}>();

const removeFromWatchLater = async (episodeId: number, event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
        await axios.delete(`/watch-later/${episodeId}`);
        router.reload();
    } catch (e) {
        console.error(e);
    }
};
</script>

<template>
    <AppLayout>
        <div class="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-8">
            <div class="container px-4 mx-auto max-w-5xl">
                <!-- Header -->
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center w-12 h-12 text-amber-600 bg-amber-100 rounded-xl dark:bg-amber-900/30 dark:text-amber-400">
                            <Clock class="w-6 h-6" />
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">المشاهدة لاحقاً</h1>
                            <p class="text-sm text-gray-500 dark:text-gray-400">الحلقات التي أضفتها للمشاهدة لاحقاً</p>
                        </div>
                    </div>
                    <span class="px-3 py-1 text-sm font-medium text-amber-600 bg-amber-100 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
                        {{ watchLater.data.length }} حلقة
                    </span>
                </div>

                <!-- Watch Later List -->
                <div v-if="watchLater.data.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500 bg-white border border-gray-100 rounded-2xl dark:bg-neutral-900 dark:border-neutral-800">
                    <Clock class="w-16 h-16 mb-4 opacity-20" />
                    <p class="text-lg font-medium">لا توجد حلقات محفوظة</p>
                    <p class="text-sm">أضف الحلقات التي تريد مشاهدتها لاحقاً</p>
                </div>

                <div v-else class="grid gap-4 md:grid-cols-2">
                    <div v-for="item in watchLater.data" :key="item.id"
                         class="relative overflow-hidden transition-all bg-white border border-gray-100 rounded-xl dark:bg-neutral-900 dark:border-neutral-800 hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-800 group">
                        
                        <Link :href="`/ar/episodes/${item.id}`" class="flex gap-4 p-4">
                            <!-- Image -->
                            <div class="relative overflow-hidden rounded-lg shrink-0 w-32 h-20">
                                <img :src="item.image" class="object-cover w-full h-full" />
                                <div class="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 group-hover:opacity-100">
                                    <Play class="w-8 h-8 text-white" />
                                </div>
                            </div>

                            <!-- Content -->
                            <div class="flex flex-col justify-center flex-1 min-w-0 gap-1">
                                <span class="text-base font-bold text-gray-900 truncate dark:text-white">{{ item.series_title }}</span>
                                <div class="flex items-center gap-2">
                                    <span class="px-2 py-0.5 text-xs font-medium text-indigo-600 bg-indigo-100 rounded dark:bg-indigo-900/30 dark:text-indigo-400">
                                        الحلقة {{ item.episode_number }}
                                    </span>
                                </div>
                                <span class="text-xs text-gray-400">أضيفت {{ item.added_at }}</span>
                            </div>
                        </Link>

                        <!-- Remove Button -->
                        <button @click="removeFromWatchLater(item.id, $event)" 
                                class="absolute p-2 text-gray-400 transition-all rounded-full opacity-0 top-2 left-2 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 group-hover:opacity-100">
                            <Trash2 class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="watchLater.last_page > 1" class="flex justify-center gap-2 mt-8">
                    <Link v-for="link in watchLater.links" :key="link.label" :href="link.url || '#'"
                          class="px-4 py-2 text-sm font-medium transition-colors rounded-lg"
                          :class="link.active ? 'bg-amber-600 text-white' : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700'"
                          v-html="link.label">
                    </Link>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
