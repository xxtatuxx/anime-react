<script setup lang="ts">
import AppLayout from "@/layouts/AR-HomeLayout.vue";
import { ref, watch, computed } from "vue";
import { usePage, router as inertia, Head, Link } from "@inertiajs/vue3";
import {
  Clock,
  Star,
  Zap,
  Search,
  Play,
  ChevronLeft, // السهم المناسب للعربية (يشير لليسار للمزيد)
  Film,
  Tv,
  Eye,
  MessageCircle
} from "lucide-vue-next";

import { Episode } from "@/types";

// ----- البيانات من السيرفر -----
const page = usePage<{
  episodes: { data: Episode[]; next_page_url?: string; current_page?: number };
  animes?: any[];
  filters?: { search?: string };
}>();

// ----- حلقات Grid -----
const episodes = ref<Episode[]>(page.props.episodes.data || []);
const nextPageUrl = ref(page.props.episodes.next_page_url || null);
const currentPage = ref(page.props.episodes.current_page || 1);
const loadingMore = ref(false);
const search = ref(page.props.filters?.search || "");

// ----- فلترة الأنميات -----
const movies = computed(
  () => page.props.animes?.filter((anime: any) => anime.type === "Movie") || []
);
const tvAnimes = computed(
  () => page.props.animes?.filter((anime: any) => anime.type === "tv") || []
);

watch(search, (value) => {
  currentPage.value = 1;
  inertia.get(
    "/ar/home",
    { search: value, page: currentPage.value },
    {
      preserveState: true,
      preserveScroll: true,
      only: ["episodes", "filters", "animes"],
      onSuccess: (pageResponse) => {
        episodes.value = pageResponse.props.episodes.data;
        nextPageUrl.value = pageResponse.props.episodes.next_page_url || null;
      },
    }
  );
});

const loadMoreEpisodes = () => {
  if (!nextPageUrl.value || loadingMore.value) return;
  loadingMore.value = true;
  currentPage.value++;
  inertia.get(
    "/ar/home",
    { page: currentPage.value, search: search.value },
    {
      preserveState: true,
      preserveScroll: true,
      only: ["episodes", "animes"],
      onSuccess: (pageResponse) => {
        episodes.value.push(...pageResponse.props.episodes.data);
        nextPageUrl.value = pageResponse.props.episodes.next_page_url || null;
      },
      onFinish: () => {
        loadingMore.value = false;
      },
    }
  );
};
</script>

<template>
  <Head title="الرئيسية - AnimeLast" />

  <AppLayout>
    <div dir="rtl" class="min-h-screen bg-[#f9f9f9] dark:bg-[#0f0f0f] font-cairo pb-12 text-right">
      
      <div class="max-w-[1600px] mx-auto px-4 md:px-6 py-8 space-y-12">

        <section>
            <div class="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl">
                        <Zap class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">أحدث الحلقات</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">حلقات تم إضافتها مؤخراً</p>
                    </div>
                </div>
                
                <div class="relative w-full md:w-80">
                    <Search class="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                    <input 
                        v-model="search"
                        type="text" 
                        placeholder="بحث عن حلقة..." 
                        class="w-full pr-10 pl-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    />
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div 
                    v-for="episode in episodes" 
                    :key="episode.id"
                    @click="inertia.visit(`/ar/episodes/${episode.id}`)"
                    class="group flex bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#333] rounded-xl overflow-hidden hover:border-indigo-500/50 hover:shadow-lg dark:hover:shadow-indigo-900/10 transition-all cursor-pointer h-32"
                >
                    <div class="relative w-[140px] h-full shrink-0 overflow-hidden">
                        <img 
                            v-if="episode.thumbnail"
                            :src="`/storage/${episode.thumbnail}`" 
                            class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                        <div v-else class="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-800">
                            <Tv class="w-8 h-8 text-gray-400" />
                        </div>
                        <div class="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/30 group-hover:opacity-100">
                            <Play class="w-8 h-8 text-white fill-current" />
                        </div>
                        <span class="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            EP {{ episode.episode_number }}
                        </span>
                    </div>

                    <div class="flex flex-col justify-center flex-1 min-w-0 p-3">
                        <div class="flex items-start justify-between pl-1 mb-1">
                            <h3 class="ml-2 text-sm font-bold text-gray-900 transition-colors dark:text-white line-clamp-1 group-hover:text-indigo-500" :title="episode.series?.title">
                                {{ episode.series?.title || 'عنوان غير متوفر' }}
                            </h3>
                            <span v-if="episode.is_published" class="text-[9px] shrink-0 font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">جديد</span>
                        </div>
                        
                        <p class="pl-1 mb-auto text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-1">
                             {{ episode.title || episode.series?.description || 'مشاهدة ممتعة' }}
                        </p>
                        
                        <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-[#333]">
                            <div class="flex items-center gap-1 text-[10px] text-gray-400">
                                <Clock class="w-3 h-3" />
                                <span>24 د</span>
                            </div>

                            <div class="flex items-center gap-3">
                                <div class="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400" title="المشاهدات">
                                    <Eye class="w-3.5 h-3.5" />
                                    <span class="font-medium">{{ episode.views || '1.2k' }}</span>
                                </div>

                                <div class="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400" title="التعليقات">
                                    <MessageCircle class="w-3.5 h-3.5" />
                                    <span class="font-medium">{{ episode.comments_count || '45' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="nextPageUrl" class="flex justify-center mt-8">
                <button 
                    @click="loadMoreEpisodes" 
                    :disabled="loadingMore"
                    class="px-8 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-full text-sm font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
                >
                    {{ loadingMore ? 'جاري التحميل...' : 'عرض المزيد من الحلقات' }}
                </button>
            </div>
        </section>

        <section v-if="movies.length > 0">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                        <Film class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">أفلام مختارة</h2>
                </div>
                <Link href="/animes?type=Movie" class="flex items-center gap-1 text-sm font-bold text-indigo-500 hover:text-indigo-600">
                    عرض الكل <ChevronLeft class="w-4 h-4" />
                </Link>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div 
                    v-for="movie in movies" 
                    :key="movie.id"
                    @click="inertia.visit(`/animes/${movie.id}`)"
                    class="group flex bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#333] rounded-xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg transition-all cursor-pointer h-40"
                >
                    <div class="relative h-full w-28 shrink-0">
                        <img 
                            v-if="movie.cover"
                            :src="`/storage/${movie.cover}`" 
                            class="object-cover w-full h-full"
                        />
                        <div v-else class="flex items-center justify-center w-full h-full text-xs bg-gray-200 dark:bg-gray-800">No Img</div>
                        <div class="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            FILM
                        </div>
                    </div>

                    <div class="flex flex-col flex-1 p-4">
                        <h3 class="mb-1 text-base font-bold text-gray-900 transition-colors dark:text-white line-clamp-1 group-hover:text-purple-500">
                            {{ movie.title }}
                        </h3>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{{ movie.type || 'Movie' }}</span>
                            <div class="flex items-center gap-1 text-xs font-bold text-yellow-500">
                                <Star class="w-3 h-3 fill-current" />
                                {{ movie.rating || 'N/A' }}
                            </div>
                        </div>
                        <p class="text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">
                            {{ movie.description || 'لا يوجد وصف متاح حالياً لهذا الفيلم.' }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section v-if="tvAnimes.length > 0">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-xl">
                        <Tv class="w-6 h-6 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">أحدث الأنميات</h2>
                </div>
                <Link href="/animes?type=TV" class="flex items-center gap-1 text-sm font-bold text-indigo-500 hover:text-indigo-600">
                    عرض الكل <ChevronLeft class="w-4 h-4" />
                </Link>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div 
                    v-for="anime in tvAnimes" 
                    :key="anime.id"
                    @click="inertia.visit(`/animes/${anime.id}`)"
                    class="group flex bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#333] rounded-xl overflow-hidden hover:border-pink-500/50 hover:shadow-lg transition-all cursor-pointer h-36"
                >
                    <div class="relative w-24 h-full shrink-0">
                        <img 
                            v-if="anime.cover"
                            :src="`/storage/${anime.cover}`" 
                            class="object-cover w-full h-full"
                        />
                        <div v-else class="flex items-center justify-center w-full h-full text-xs bg-gray-200 dark:bg-gray-800">No Img</div>
                        <div class="absolute top-2 right-2 bg-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            TV
                        </div>
                    </div>

                    <div class="flex flex-col flex-1 p-3">
                        <h3 class="mb-1 text-sm font-bold text-gray-900 transition-colors dark:text-white line-clamp-1 group-hover:text-pink-500">
                            {{ anime.title }}
                        </h3>
                        <div class="flex items-center gap-2 mb-2">
                             <div class="flex items-center gap-1 text-xs font-bold text-yellow-500">
                                <Star class="w-3 h-3 fill-current" />
                                {{ anime.rating || 'N/A' }}
                            </div>
                            <span class="text-[10px] text-gray-400">•</span>
                            <span class="text-[10px] text-gray-500">{{ anime.status || 'مستمر' }}</span>
                        </div>
                        <p class="mb-auto text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                            {{ anime.description || 'لا يوجد وصف متاح.' }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

      </div>

      <footer class="bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-[#222] mt-12 pt-12 pb-6">
        <div class="max-w-6xl px-6 mx-auto text-center">
             <h2 class="mb-4 text-2xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">ANIME LAST</h2>
             <p class="max-w-lg mx-auto mb-8 text-sm text-gray-500">منصتك الأولى لمشاهدة الأنمي بأفضل جودة وترجمة احترافية. تابع أحدث الحلقات والأفلام فور صدورها.</p>
             <div class="flex justify-center gap-6 mb-8">
                 <a href="#" class="text-gray-400 transition hover:text-indigo-500">تواصل معنا</a>
                 <a href="#" class="text-gray-400 transition hover:text-indigo-500">الشروط والأحكام</a>
                 <a href="#" class="text-gray-400 transition hover:text-indigo-500">سياسة الخصوصية</a>
             </div>
             <p class="text-xs text-gray-600 dark:text-gray-500">© 2025 Anime Last. جميع الحقوق محفوظة.</p>
        </div>
      </footer>

    </div>
  </AppLayout>
</template>

<style>
/* Custom Scrollbar */
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