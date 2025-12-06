<script setup lang="ts">
import AppLayout from '@/layouts/AR-HomeLayout.vue';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/vue3';
import type { BreadcrumbItem } from '@/types';
import { computed, ref } from 'vue';
import { Search, Play, Video, Edit, ArrowRight, Calendar, Clock, Star, Layers } from 'lucide-vue-next';

const props = defineProps<{ anime: Record<string, any> }>();

// --- URLs ---
const posterUrl = computed(() => props.anime.image ? `/storage/${props.anime.image}` : null);

// --- Breadcrumbs ---
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'قائمة الأنمي', href: '/animes' },
    { title: props.anime.title || 'التفاصيل', href: `/animes/${props.anime.id}` },
];

// --- Search Logic for Episodes ---
const searchQuery = ref('');
const filteredEpisodes = computed(() => {
    if (!props.anime.episodes) return [];
    if (!searchQuery.value) return props.anime.episodes;
    
    const query = searchQuery.value.toLowerCase();
    return props.anime.episodes.filter((ep: any) => 
        (ep.title && ep.title.toLowerCase().includes(query)) || 
        (ep.title_en && ep.title_en.toLowerCase().includes(query)) ||
        (ep.episode_number && ep.episode_number.toString().includes(query))
    );
});

// --- Formatting & Data ---
const formattedReleaseDate = computed(() => {
    if (!props.anime.release_date) return '-';
    const date = new Date(props.anime.release_date);
    if (Number.isNaN(date.getTime())) return props.anime.release_date;
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
});

const infoItems = computed(() => [
    { label: 'الحالة', value: props.anime.status, icon: null },
    { label: 'النوع', value: props.anime.type, icon: Layers },
    { label: 'الموسم', value: props.anime.season?.name, icon: Calendar },
    { label: 'الاستوديو', value: props.anime.studio_name, icon: Video },
    { label: 'اللغة', value: props.anime.language, icon: null },
    { label: 'تاريخ العرض', value: formattedReleaseDate.value, icon: Calendar },
]);
</script>

<template>
    <Head :title="props.anime.title || 'تفاصيل الأنمي'" />

    <AppLayout >
        <div dir="rtl" class="flex flex-col flex-1 min-h-full gap-8 p-4 md:p-8">

            <div class="relative overflow-hidden bg-white border shadow-sm dark:bg-neutral-900 border-sidebar-border/60 rounded-3xl">
                <div class="flex flex-col md:flex-row">
                    
                    <div class="relative w-full md:w-72 lg:w-80 shrink-0">
                        <div class="h-full min-h-[400px] relative">
                            <img 
                                v-if="posterUrl" 
                                :src="posterUrl" 
                                alt="Anime poster" 
                                class="object-cover w-full h-full" 
                            />
                            <div v-else class="flex items-center justify-center w-full h-full text-sm text-white bg-indigo-500">
                                لا توجد صورة
                            </div>
                            <div v-if="props.anime.rating" class="absolute flex items-center gap-1 px-3 py-1 text-sm font-bold text-white rounded-full bg-black/70 backdrop-blur-md top-4 right-4">
                                <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span>{{ props.anime.rating }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col flex-1 p-6 lg:p-8">
                        
                        <div class="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-start">
                            <div>
                                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ props.anime.title }}</h1>
                                <h2 class="text-lg font-medium text-muted-foreground">{{ props.anime.title_en }}</h2>
                            </div>
                            <div class="flex items-center gap-2">
                              
                             
                            </div>
                        </div>

                        <p class="mb-6 text-base leading-relaxed text-gray-600 transition-all dark:text-gray-300 line-clamp-4 hover:line-clamp-none">
                            {{ props.anime.description || props.anime.description_en || 'لا يوجد وصف متاح.' }}
                        </p>

                        <div class="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-3 xl:grid-cols-4">
                            <div v-for="item in infoItems" :key="item.label" class="p-3 border rounded-xl bg-gray-50 dark:bg-white/5 border-sidebar-border/40">
                                <span class="block mb-1 text-xs text-muted-foreground">{{ item.label }}</span>
                                <div class="flex items-center gap-2">
                                    <component :is="item.icon" v-if="item.icon" class="w-4 h-4 text-indigo-500" />
                                    <span class="text-sm font-semibold">{{ item.value || '-' }}</span>
                                </div>
                            </div>
                             <div class="p-3 border rounded-xl bg-gray-50 dark:bg-white/5 border-sidebar-border/40">
                                <span class="block mb-1 text-xs text-muted-foreground">المدة</span>
                                <div class="flex items-center gap-2">
                                    <Clock class="w-4 h-4 text-indigo-500" />
                                    <span class="text-sm font-semibold">{{ props.anime.duration ? `${props.anime.duration} دقيقة` : '-' }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col justify-between gap-6 mt-auto md:flex-row md:items-end">
                            <div class="flex-1">
                                <div v-if="props.anime.categories && props.anime.categories.length" class="flex flex-wrap gap-2">
                                    <span v-for="(category, index) in props.anime.categories" :key="index" class="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-full dark:bg-indigo-500/20 dark:text-indigo-300">
                                        {{ category.name }}
                                    </span>
                                </div>
                            </div>

                            <div class="flex flex-wrap gap-3">
                                <Button v-if="props.anime.stream_video" as-child class="bg-indigo-600 hover:bg-indigo-700">
                                    <a :href="props.anime.stream_video" target="_blank">
                                        <Play class="w-4 h-4 ml-2 fill-current" />
                                        مشاهدة الآن
                                    </a>
                                </Button>
                                <Button v-if="props.anime.trailer" variant="outline" as-child>
                                    <a :href="props.anime.trailer" target="_blank">
                                        <Video class="w-4 h-4 ml-2" />
                                        الإعلان التشويقي
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="props.anime.episodes && props.anime.episodes.length > 0" class="space-y-4">
                <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div class="flex items-center gap-3">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">الحلقات</h2>
                        <span class="px-2 py-0.5 text-xs font-bold bg-gray-200 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300">
                            {{ props.anime.episodes.length }}
                        </span>
                    </div>
                    
                    <div class="relative w-full md:w-72">
                        <Search class="absolute w-4 h-4 -translate-y-1/2 text-muted-foreground right-3 top-1/2" />
                        <input 
                            v-model="searchQuery"
                            type="text" 
                            placeholder="بحث عن رقم الحلقة..." 
                            class="w-full h-10 pl-4 text-sm transition-all bg-white border rounded-full outline-none pr-9 dark:bg-neutral-900 focus:ring-2 focus:ring-indigo-500/50 border-sidebar-border/60"
                        />
                    </div>
                </div>

                <div v-if="filteredEpisodes.length > 0" class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    <Link
                        v-for="episode in filteredEpisodes"
                        :key="episode.id"
                        :href="route('ar.episodes.show', episode.id)"
                        class="relative flex flex-col overflow-hidden transition-all duration-300 bg-white border shadow-sm group dark:bg-neutral-900 border-sidebar-border/60 rounded-2xl hover:border-indigo-500 hover:shadow-md"
                    >
                        <div class="relative overflow-hidden bg-gray-100 aspect-video dark:bg-gray-800">
                            <img
                                v-if="episode.thumbnail"
                                :src="`/storage/${episode.thumbnail}`"
                                :alt="episode.title"
                                class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            />
                            <div v-else class="flex items-center justify-center w-full h-full">
                                <Video class="w-8 h-8 text-gray-300" />
                            </div>
                            
                            <div class="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/30 group-hover:opacity-100">
                                <div class="flex items-center justify-center w-10 h-10 text-indigo-600 transition-transform transform scale-75 bg-white rounded-full shadow-lg group-hover:scale-100">
                                    <Play class="w-4 h-4 fill-current ml-0.5" />
                                </div>
                            </div>

                            <span class="absolute px-2 py-1 text-xs font-bold text-white rounded-md top-2 right-2 bg-black/60 backdrop-blur-sm">
                                حلقة {{ episode.episode_number }}
                            </span>
                        </div>

                        <div class="p-3">
                            <h3 class="text-sm font-semibold truncate transition-colors group-hover:text-indigo-500">
                                {{ episode.title || `الحلقة ${episode.episode_number}` }}
                            </h3>
                            <div class="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                <span>{{ episode.duration ? `${episode.duration} دقيقة` : '' }}</span>
                                <span v-if="episode.created_at">{{ new Date(episode.created_at).toLocaleDateString('ar-EG') }}</span>
                            </div>
                        </div>
                    </Link>
                </div>

                <div v-else class="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-2xl border-sidebar-border/60">
                    <Search class="w-10 h-10 mb-3 text-muted-foreground/50" />
                    <p class="text-muted-foreground">لا توجد حلقات تطابق بحثك.</p>
                </div>
            </div>
            
            <div v-else class="flex flex-col items-center justify-center py-12 text-center border border-dashed bg-gray-50 dark:bg-white/5 rounded-3xl border-sidebar-border/60">
                <Layers class="w-12 h-12 mb-4 text-muted-foreground/40" />
                <h3 class="text-lg font-semibold">لا توجد حلقات</h3>
                <p class="text-muted-foreground">لم يتم إضافة أي حلقات لهذا الأنمي بعد.</p>
            </div>

        </div>
    </AppLayout>
</template>