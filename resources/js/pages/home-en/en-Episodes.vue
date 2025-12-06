<script setup lang="ts">
import AppLayout from '@/layouts/EN-HomeLayout.vue';
import { Head, usePage, router as inertia, Link } from '@inertiajs/vue3';
import { ref, computed, watch } from 'vue';
import { toast } from 'vue-sonner';
import { Episode, type BreadcrumbItem } from '@/types';
import { 
  Search, 
  Zap, 
  Play, 
  Eye, 
  Clock, 
  MessageCircle, 
  LoaderCircle,
  Hash,
  Check
} from 'lucide-vue-next';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'بحث الحلقات', href: '/en/episodes-list' }
];

const page = usePage<{
    episodes: { data: Episode[]; next_page_url?: string };
    animes: Array<{ id: number; title: string; image?: string }>;
}>();

const selectedAnimeId = ref<number | null>(null);
const selectedAnimeTitle = ref<string>(''); // لعرض اسم الأنمي المختار
const animeSearchQuery = ref('');
const episodeNumber = ref<number | null>(null);
const dropdownOpen = ref(false);

const filteredAnimes = computed(() => {
    const q = animeSearchQuery.value.toLowerCase();
    return page.props.animes.filter(a => a.title.toLowerCase().includes(q));
});

const selectAnime = (anime: { id: number; title: string }) => {
    selectedAnimeId.value = anime.id;
    selectedAnimeTitle.value = anime.title;
    dropdownOpen.value = false;
    animeSearchQuery.value = anime.title; // عرض الاسم في الحقل
};

const clearSelection = () => {
    selectedAnimeId.value = null;
    selectedAnimeTitle.value = '';
    animeSearchQuery.value = '';
    episodeNumber.value = null;
    episodes.value = [];
}

const episodes = ref<Episode[]>(page.props.episodes.data || []);
const loading = ref(false);

// البحث عند تغيير الأنمي أو رقم الحلقة
watch([selectedAnimeId, episodeNumber], async ([animeId, epNumber]) => {
    if (!animeId) {
        episodes.value = [];
        return;
    }
    loading.value = true;

    try {
        await inertia.get(
            route('en.Episodes'),
            {
                anime_name: page.props.animes.find(a => a.id === animeId)?.title || '',
                episode_number: epNumber || ''
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['episodes'],
                onSuccess: (res) => {
                    episodes.value = res.props.episodes.data;
                },
                onFinish: () => {
                    loading.value = false;
                }
            }
        );
    } catch (e) {
        toast.error('حدث خطأ أثناء البحث');
        loading.value = false;
    }
});

// التوجيه عند الضغط على الحلقة
const goToEpisode = (episodeId: number) => {
    inertia.visit(route('en.episodes.show', episodeId));
};
</script>
<template>
  <Head title="Episode Search - AnimeLast" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div  class="min-h-screen bg-[#f9f9f9] dark:bg-[#0f0f0f] font-cairo pb-12 text-right">
      
      <div class="max-w-[1600px] mx-auto px-4 md:px-6 py-8 space-y-8">

        <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            
            <div class="flex items-center gap-3 shrink-0">
                <div class="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl">
                    <Zap class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Episode Library</h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Quickly search for your favorite episodes</p>
                </div>
            </div>

            <div class="flex flex-col w-full gap-3 md:flex-row lg:max-w-2xl">
                
                <div class="relative z-20 w-full">
                    <Search class="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-4 top-1/2" />
                    <input
                        v-model="animeSearchQuery"
                        placeholder="Search by anime name..."
                        @focus="dropdownOpen = true"
                        @input="dropdownOpen = true"
                        type="text"
                        class="w-full pr-10 pl-4 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    />
                    
                    <button v-if="selectedAnimeId" @click="clearSelection" class="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 hover:text-red-500">
                        <span class="text-xs font-bold">Clear</span>
                    </button>

                    <transition name="fade">
                        <div v-if="dropdownOpen && filteredAnimes.length > 0" class="absolute w-full mt-2 overflow-hidden bg-white border border-gray-100 shadow-xl dark:bg-[#1a1a1a] dark:border-[#333] rounded-2xl max-h-80 overflow-y-auto">
                            <div 
                                v-for="anime in filteredAnimes" 
                                :key="anime.id" 
                                @click="selectAnime(anime)"
                                class="flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-b border-gray-50 dark:border-[#222] last:border-0"
                            >
                                <img 
                                    v-if="anime.image" 
                                    :src="`/storage/${anime.image}`" 
                                    class="object-cover w-10 h-10 rounded-lg"
                                />
                                <div v-else class="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-lg dark:bg-gray-800">
                                    <span class="text-[9px]">N/A</span>
                                </div>
                                <span class="text-sm font-bold text-gray-700 dark:text-gray-200">{{ anime.title }}</span>
                                <Check v-if="selectedAnimeId === anime.id" class="w-4 h-4 mr-auto text-indigo-500" />
                            </div>
                        </div>
                         <div v-else-if="dropdownOpen && filteredAnimes.length === 0" class="absolute w-full p-4 mt-2 text-sm text-center text-gray-500 bg-white border border-gray-100 shadow-xl dark:bg-[#1a1a1a] dark:border-[#333] rounded-2xl">
                            No matching results
                        </div>
                    </transition>
                </div>

                <div class="relative w-full md:w-48 shrink-0">
                    <Hash class="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-4 top-1/2" />
                    <input
                        v-model.number="episodeNumber"
                        type="number"
                        min="1"
                        placeholder="Episode number..."
                        :disabled="!selectedAnimeId"
                        class="w-full pr-10 pl-4 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
            </div>
        </div>

        <div class="min-h-[300px]">
            
            <div v-if="loading" class="flex flex-col items-center justify-center py-20">
                <LoaderCircle class="w-10 h-10 text-indigo-500 animate-spin" />
                <p class="mt-4 text-sm font-bold text-gray-500">Fetching episodes...</p>
            </div>

            <div v-else-if="episodes.length > 0" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div 
                    v-for="episode in episodes" 
                    :key="episode.id"
                    @click="goToEpisode(episode.id)"
                    class="group flex bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#333] rounded-xl overflow-hidden hover:border-indigo-500/50 hover:shadow-lg dark:hover:shadow-indigo-900/10 transition-all cursor-pointer h-32"
                >
                    <div class="relative w-[140px] h-full shrink-0 overflow-hidden">
                        <img 
                            v-if="episode.thumbnail"
                            :src="`/storage/${episode.thumbnail}`" 
                            class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                        <div v-else class="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-800">
                            <Zap class="w-8 h-8 text-gray-400" />
                        </div>
                        
                        <div class="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/30 group-hover:opacity-100">
                            <Play class="w-8 h-8 text-white fill-current" />
                        </div>
                        
                        <span class="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            EP {{ episode.episode_number }}
                        </span>
                    </div>

                    <div class="flex flex-col justify-center flex-1 min-w-0 p-3">
                        <div class="flex items-start justify-between mb-1">
                            <h3 class="text-sm font-bold text-gray-900 transition-colors dark:text-white line-clamp-1 group-hover:text-indigo-500" :title="episode.series?.title || selectedAnimeTitle">
                                {{ episode.series?.title || selectedAnimeTitle || 'Title not available' }}
                            </h3>
                            <span v-if="episode.is_published" class="text-[9px] shrink-0 font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">New</span>
                        </div>
                        
                        <p class="mb-auto text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-1">
                             {{ episode.title || 'Enjoy this episode' }}
                        </p>
                        
                        <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-[#333]">
                            <div class="flex items-center gap-1 text-[10px] text-gray-400">
                                <Clock class="w-3 h-3" />
                                <span>24 min</span>
                            </div>

                            <div class="flex items-center gap-3">
                                <div class="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400" title="Views">
                                    <Eye class="w-3.5 h-3.5" />
                                    <span class="font-medium">{{ episode.views || '0' }}</span>
                                </div>

                                <div class="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400" title="Comments">
                                    <MessageCircle class="w-3.5 h-3.5" />
                                    <span class="font-medium">{{ episode.comments_count || '0' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <div class="p-4 mb-4 bg-gray-100 rounded-full dark:bg-gray-800">
                    <Search class="w-10 h-10 text-gray-400" v-if="!selectedAnimeId" />
                    <Hash class="w-10 h-10 text-gray-400" v-else />
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ !selectedAnimeId ? 'Start by selecting an anime' : 'No matching episodes' }}
                </h3>
                <p class="text-sm text-gray-500">
                    {{ !selectedAnimeId ? 'Use the search box above to select an anime and view its episodes' : 'Check the episode number or try searching for other episodes' }}
                </p>
            </div>

        </div>

      </div>
    </div>
  </AppLayout>
</template>


<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Scrollbar Customization */
::-webkit-scrollbar {
    width: 8px;
}
::-webkit-scrollbar-track {
    background: #1a1a1a; 
}
::-webkit-scrollbar-thumb {
    background: #333; 
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: #4f46e5; 
}
</style>