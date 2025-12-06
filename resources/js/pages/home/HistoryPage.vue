<script setup lang="ts">
import { ref } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import { History, PlayCircle, MessageCircle, Reply, Heart, Trash2, ArrowRight } from 'lucide-vue-next';
import AppLayout from '@/layouts/AR-HomeLayout.vue';
import axios from 'axios';

const props = defineProps<{
    history: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
    };
}>();

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
        case 'comment': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
        case 'reply': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
        case 'like': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
        default: return 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30';
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

const getActionLabel = (type: string) => {
    switch (type) {
        case 'comment': return 'تعليق';
        case 'reply': return 'رد';
        case 'like': return 'إعجاب';
        default: return 'مشاهدة';
    }
};

const clearAllHistory = async () => {
    if (confirm('هل أنت متأكد من حذف كل السجل؟')) {
        try {
            await axios.delete('/history/clear-all');
            router.reload();
        } catch (e) {
            console.error(e);
        }
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
                        <div class="flex items-center justify-center w-12 h-12 text-indigo-600 bg-indigo-100 rounded-xl dark:bg-indigo-900/30 dark:text-indigo-400">
                            <History class="w-6 h-6" />
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">سجل النشاط</h1>
                            <p class="text-sm text-gray-500 dark:text-gray-400">جميع أنشطتك من مشاهدات وتعليقات وإعجابات</p>
                        </div>
                    </div>
                    <button @click="clearAllHistory" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 transition-colors bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
                        <Trash2 class="w-4 h-4" />
                        مسح السجل
                    </button>
                </div>

                <!-- History List -->
                <div v-if="history.data.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500 bg-white border border-gray-100 rounded-2xl dark:bg-neutral-900 dark:border-neutral-800">
                    <History class="w-16 h-16 mb-4 opacity-20" />
                    <p class="text-lg font-medium">لا يوجد سجل نشاط</p>
                    <p class="text-sm">ابدأ بمشاهدة الحلقات والتفاعل معها</p>
                </div>

                <div v-else class="space-y-3">
                    <Link v-for="item in history.data" :key="item.id" :href="`/ar/episodes/${item.episode_id}`"
                          class="flex gap-4 p-4 transition-all bg-white border border-gray-100 rounded-xl dark:bg-neutral-900 dark:border-neutral-800 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 group">
                        
                        <!-- Image -->
                        <div class="relative overflow-hidden rounded-lg shrink-0 w-36 h-24">
                            <img :src="item.image" class="object-cover w-full h-full" />
                            <div class="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 group-hover:opacity-100">
                                <component :is="getActionIcon(item.type)" class="w-8 h-8 text-white" />
                            </div>
                            <!-- Type Badge -->
                            <div class="absolute px-2 py-1 text-xs font-medium rounded top-2 right-2" :class="getActionColor(item.type)">
                                {{ getActionLabel(item.type) }}
                            </div>
                        </div>

                        <!-- Content -->
                        <div class="flex flex-col justify-center flex-1 min-w-0 gap-1">
                            <div class="flex items-center gap-2">
                                <span class="text-lg font-bold text-gray-900 dark:text-white">{{ item.series_title }}</span>
                                <span class="px-2 py-0.5 text-xs font-medium text-indigo-600 bg-indigo-100 rounded dark:bg-indigo-900/30 dark:text-indigo-400">
                                    الحلقة {{ item.episode_number }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" dir="rtl">
                                {{ getActionDescription(item) }}
                            </p>
                            <span class="text-xs text-gray-400">{{ item.created_at }}</span>
                        </div>

                        <!-- Arrow -->
                        <div class="flex items-center">
                            <ArrowRight class="w-5 h-5 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500 dark:text-gray-600" />
                        </div>
                    </Link>
                </div>

                <!-- Pagination -->
                <div v-if="history.last_page > 1" class="flex justify-center gap-2 mt-8">
                    <Link v-for="link in history.links" :key="link.label" :href="link.url || '#'"
                          class="px-4 py-2 text-sm font-medium transition-colors rounded-lg"
                          :class="link.active ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700'"
                          v-html="link.label">
                    </Link>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
