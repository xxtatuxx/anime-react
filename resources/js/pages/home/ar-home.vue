<script setup lang="ts">
import AppLayout from "@/layouts/AR-HomeLayout.vue";
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from "vue";
import { usePage, router as inertia, Head, Link } from "@inertiajs/vue3";
import axios from "axios";
import {
  Clock, Star, Zap, Search, Play, ChevronLeft, Film, Tv, Eye, Info, X, Flame
} from "lucide-vue-next";

import { Episode } from "@/types";

const page = usePage<{
  episodes: { data: Episode[]; next_page_url?: string; current_page?: number };
  animes?: any[];
  filters?: { search?: string };
}>();

const episodes = ref<Episode[]>(page.props.episodes.data || []);
const nextPageUrl = ref(page.props.episodes.next_page_url || null);
const currentPage = ref(page.props.episodes.current_page || 1);
const loadingMore = ref(false);
const search = ref("");
const isSearching = ref(false);

// Lazy Loading للأقسام
const moviesSection = ref<HTMLElement | null>(null);
const animesSection = ref<HTMLElement | null>(null);
const showMovies = ref(false);
const showAnimes = ref(false);

let moviesObserver: IntersectionObserver | null = null;
let animesObserver: IntersectionObserver | null = null;
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const setupSectionObservers = () => {
  if (moviesSection.value) {
    moviesObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          showMovies.value = true;
          moviesObserver?.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    moviesObserver.observe(moviesSection.value);
  }

  if (animesSection.value) {
    animesObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          showAnimes.value = true;
          animesObserver?.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    animesObserver.observe(animesSection.value);
  }
};

onMounted(() => {
  nextTick(() => setupSectionObservers());
});

onUnmounted(() => {
  document.body.style.overflow = '';
  moviesObserver?.disconnect();
  animesObserver?.disconnect();
  if (searchTimeout) clearTimeout(searchTimeout);
});

const movies = computed(() => page.props.animes?.filter((anime: any) => anime.type === "Movie") || []);
const tvAnimes = computed(() => page.props.animes?.filter((anime: any) => anime.type === "tv") || []);

const isModalOpen = ref(false);
const selectedEpisode = ref<any>(null);

const openModal = (episode: any) => {
  selectedEpisode.value = episode;
  isModalOpen.value = true;
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  isModalOpen.value = false;
  document.body.style.overflow = '';
  setTimeout(() => { selectedEpisode.value = null; }, 300);
};

const goToEpisode = (id: number) => {
  document.body.style.overflow = '';
  isModalOpen.value = false;
  inertia.visit(`/ar/episodes/${id}`);
};

// البحث باستخدام axios
watch(search, (value) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    isSearching.value = true;
    currentPage.value = 1;
    try {
      const response = await axios.get('/api/home/episodes', { params: { search: value, page: 1 } });
      episodes.value = response.data.data;
      nextPageUrl.value = response.data.next_page_url || null;
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      isSearching.value = false;
    }
  }, 300);
});

// تحميل المزيد - بدون تأخير
const loadMoreEpisodes = async () => {
  if (!nextPageUrl.value || loadingMore.value) return;
  loadingMore.value = true;
  await nextTick();
  currentPage.value++;
  try {
    const response = await axios.get('/api/home/episodes', { params: { search: search.value, page: currentPage.value } });
    episodes.value.push(...response.data.data);
    nextPageUrl.value = response.data.next_page_url || null;
  } catch (error) {
    console.error('Load more error:', error);
    currentPage.value--;
  } finally {
    loadingMore.value = false;
  }
};
</script>

<template>
  <Head title="الرئيسية - AnimeLast" />
  <AppLayout>
    <div dir="rtl" class="min-h-screen bg-[#f9f9f9] dark:bg-[#0f0f0f] font-cairo pb-12 text-right">
      <div class="max-w-[1600px] mx-auto px-4 md:px-6 py-8 space-y-12">

        <!-- ✅ Episodes Section -->
        <section>
          <div class="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl">
                <Zap class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">أحدث الحلقات</h2>
            </div>
            <div class="relative w-full md:w-80">
              <Search class="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
              <input v-model="search" type="text" placeholder="بحث..." class="w-full pr-10 pl-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              <div v-show="isSearching" class="absolute left-3 top-1/2 -translate-y-1/2">
                <div class="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-x-4 gap-y-8">
            <div v-for="(episode, index) in episodes" :key="episode.id" @click="inertia.visit(`/ar/episodes/${episode.id}`)" class="relative flex flex-col gap-2 transition-all duration-300 cursor-pointer group episode-card" :style="{ animationDelay: `${index * 30}ms` }">
              <div class="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gray-200 dark:bg-[#1a1a1a] shadow-sm group-hover:shadow-md transition-all">
                <img v-if="episode.thumbnail" :src="`/storage/${episode.thumbnail}`" loading="lazy" decoding="async" class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                <div v-else class="flex items-center justify-center w-full h-full"><Tv class="w-6 h-6 text-gray-400" /></div>
                <div v-if="index < 5" class="absolute top-0 right-0 z-20">
                  <span class="flex items-center gap-0.5 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg shadow-md animate-pulse"><Flame class="w-3 h-3 fill-current" /> جديد</span>
                </div>
                <div @click.stop="openModal(episode)" class="absolute z-10 top-2 left-2">
                  <div class="flex items-center justify-center text-white transition-all border rounded-full shadow-lg w-7 h-7 bg-black/50 backdrop-blur-md hover:bg-indigo-600 hover:scale-110 border-white/10" title="تفاصيل الحلقة"><Info class="w-4 h-4" /></div>
                </div>
                <span class="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-sm text-white text-[12px] font-bold px-1.5 py-0.5 rounded">الحلقة {{ episode.episode_number }}</span>
                <div class="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-100">
                  <div class="p-2 text-white transition-transform transform scale-50 rounded-full shadow-lg bg-indigo-600/90 group-hover:scale-100"><Play class="w-4 h-4 fill-current ml-0.5" /></div>
                </div>
              </div>
              <div class="flex flex-col px-1">
                <h3 class="text-sm font-bold text-gray-900 transition-colors dark:text-gray-100 line-clamp-1 group-hover:text-indigo-500">{{ episode.series?.title || 'عنوان غير متوفر' }}</h3>
                <div class="flex items-center justify-between mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                  <span class="truncate max-w-[70%] opacity-80">{{ episode.title || 'حلقة جديدة' }}</span>
                  <div class="flex items-center gap-0.5 opacity-70"><Eye class="w-3 h-3" /> {{ episode.views }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-if="episodes.length === 0 && !isSearching" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="text-6xl mb-4">🔍</div>
            <p class="text-gray-500 dark:text-gray-400">لا توجد نتائج</p>
          </div>

          <!-- 🔘 Load More - Skeleton فوري باستخدام v-show -->
          <div class="mt-8">
            <div v-show="loadingMore" class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-x-4 gap-y-8 mb-8">
              <div v-for="i in 4" :key="'load-' + i" class="flex flex-col gap-2">
                <div class="relative aspect-[16/10] w-full overflow-hidden rounded-xl skeleton-box">
                  <div class="absolute bottom-2 right-2 h-5 w-16 rounded skeleton-box-inner"></div>
                </div>
                <div class="flex flex-col gap-2 px-1">
                  <div class="h-4 w-3/4 rounded skeleton-box"></div>
                  <div class="flex items-center justify-between">
                    <div class="h-3 w-1/2 rounded skeleton-box"></div>
                    <div class="h-3 w-10 rounded skeleton-box"></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="nextPageUrl && !loadingMore" class="flex justify-center">
              <button @click="loadMoreEpisodes" class="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40">
                تحميل المزيد
              </button>
            </div>

            <div v-show="!nextPageUrl && episodes.length > 0 && !loadingMore" class="flex justify-center py-4">
              <span class="text-sm text-gray-400 dark:text-gray-500">🎬 لقد وصلت لنهاية القائمة</span>
            </div>
          </div>
        </section>

        <!-- 🎬 Movies Section -->
        <section ref="moviesSection">
          <div v-if="!showMovies" class="space-y-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl skeleton-box"></div>
                <div class="h-7 w-32 rounded-lg skeleton-box"></div>
              </div>
              <div class="h-5 w-20 rounded skeleton-box"></div>
            </div>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div v-for="i in 3" :key="i" class="flex h-40 overflow-hidden rounded-xl skeleton-box">
                <div class="h-full w-28 shrink-0 skeleton-box-inner"></div>
                <div class="flex flex-col flex-1 gap-3 p-4">
                  <div class="h-5 w-3/4 rounded skeleton-box-inner"></div>
                  <div class="flex gap-2">
                    <div class="h-4 w-16 rounded-full skeleton-box-inner"></div>
                    <div class="h-4 w-12 rounded skeleton-box-inner"></div>
                  </div>
                  <div class="h-3 w-full rounded skeleton-box-inner"></div>
                </div>
              </div>
            </div>
          </div>

          <Transition name="content-fade">
            <div v-if="movies.length > 0 && showMovies">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl"><Film class="w-6 h-6 text-purple-600 dark:text-purple-400" /></div>
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">أفلام مختارة</h2>
                </div>
                <Link href="/ar/movies" class="flex items-center gap-1 text-sm font-bold text-indigo-500 hover:text-indigo-600">عرض الكل <ChevronLeft class="w-4 h-4" /></Link>
              </div>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div v-for="movie in movies" :key="movie.id" @click="inertia.visit(`/ar/animes/${movie.id}`)" class="group flex bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#333] rounded-xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg transition-all cursor-pointer h-40">
                  <div class="relative h-full w-28 shrink-0">
                    <img v-if="movie.cover" :src="`/storage/${movie.cover}`" loading="lazy" decoding="async" class="object-cover w-full h-full" />
                    <div v-else class="flex items-center justify-center w-full h-full text-xs bg-gray-200 dark:bg-gray-800">No Img</div>
                    <div class="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">FILM</div>
                  </div>
                  <div class="flex flex-col flex-1 p-4">
                    <h3 class="mb-1 text-base font-bold text-gray-900 transition-colors dark:text-white line-clamp-1 group-hover:text-purple-500">{{ movie.title }}</h3>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{{ movie.type || 'Movie' }}</span>
                      <div class="flex items-center gap-1 text-xs font-bold text-yellow-500"><Star class="w-3 h-3 fill-current" /> {{ movie.rating || 'N/A' }}</div>
                    </div>
                    <p class="text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">{{ movie.description || 'لا يوجد وصف' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </section>

        <!-- 📺 TV Animes Section -->
        <section ref="animesSection">
          <div v-if="!showAnimes" class="space-y-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl skeleton-box"></div>
                <div class="h-7 w-36 rounded-lg skeleton-box"></div>
              </div>
              <div class="h-5 w-20 rounded skeleton-box"></div>
            </div>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div v-for="i in 3" :key="i" class="flex h-36 overflow-hidden rounded-xl skeleton-box">
                <div class="w-24 h-full shrink-0 skeleton-box-inner"></div>
                <div class="flex flex-col flex-1 gap-2 p-3">
                  <div class="h-4 w-2/3 rounded skeleton-box-inner"></div>
                  <div class="flex gap-2">
                    <div class="h-3 w-12 rounded skeleton-box-inner"></div>
                    <div class="h-3 w-16 rounded skeleton-box-inner"></div>
                  </div>
                  <div class="h-3 w-full rounded skeleton-box-inner"></div>
                </div>
              </div>
            </div>
          </div>

          <Transition name="content-fade">
            <div v-if="tvAnimes.length > 0 && showAnimes">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-xl"><Tv class="w-6 h-6 text-pink-600 dark:text-pink-400" /></div>
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">أحدث الأنميات</h2>
                </div>
                <Link href="/ar/anime" class="flex items-center gap-1 text-sm font-bold text-indigo-500 hover:text-indigo-600">عرض الكل <ChevronLeft class="w-4 h-4" /></Link>
              </div>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div v-for="anime in tvAnimes" :key="anime.id" @click="inertia.visit(`/ar/animes/${anime.id}`)" class="group flex bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#333] rounded-xl overflow-hidden hover:border-pink-500/50 hover:shadow-lg transition-all cursor-pointer h-36">
                  <div class="relative w-24 h-full shrink-0">
                    <img v-if="anime.cover" :src="`/storage/${anime.cover}`" loading="lazy" decoding="async" class="object-cover w-full h-full" />
                    <div v-else class="flex items-center justify-center w-full h-full text-xs bg-gray-200 dark:bg-gray-800">No Img</div>
                    <div class="absolute top-2 right-2 bg-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">TV</div>
                  </div>
                  <div class="flex flex-col flex-1 p-3">
                    <h3 class="mb-1 text-sm font-bold text-gray-900 transition-colors dark:text-white line-clamp-1 group-hover:text-pink-500">{{ anime.title }}</h3>
                    <div class="flex items-center gap-2 mb-2">
                      <div class="flex items-center gap-1 text-xs font-bold text-yellow-500"><Star class="w-3 h-3 fill-current" /> {{ anime.rating || 'N/A' }}</div>
                      <span class="text-[10px] text-gray-400">•</span>
                      <span class="text-[10px] text-gray-500">{{ anime.status || 'مستمر' }}</span>
                    </div>
                    <p class="mb-auto text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">{{ anime.description || 'لا يوجد وصف' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </section>

      </div>

      <footer class="bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-[#222] mt-12 pt-12 pb-6 text-center">
        <h2 class="mb-4 text-2xl font-black text-indigo-600 dark:text-indigo-400">ANIME LAST</h2>
        <p class="text-xs text-gray-600 dark:text-gray-500">© 2025 Anime Last.</p>
      </footer>
    </div>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click="closeModal">
          <div class="relative w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#333] transform transition-all" @click.stop>
            <button @click="closeModal" class="absolute z-20 flex items-center justify-center w-8 h-8 text-white transition-colors rounded-full top-3 right-3 bg-black/40 hover:bg-black/60"><X class="w-5 h-5" /></button>
            <div class="relative w-full h-48 bg-gray-900">
              <img :src="`/storage/${selectedEpisode?.thumbnail}`" loading="lazy" class="object-cover w-full h-full opacity-90" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] to-transparent opacity-90 dark:opacity-100"></div>
              <div class="absolute inset-0 opacity-100 bg-gradient-to-t from-white to-transparent dark:opacity-0" style="mix-blend-mode: multiply;"></div>
              <div class="absolute bottom-4 right-4 left-4" dir="rtl">
                <div class="inline-block px-2 py-1 mb-2 text-[10px] font-bold text-white bg-indigo-600 rounded">الحلقة {{ selectedEpisode?.episode_number }}</div>
                <h3 class="text-lg font-bold leading-tight text-white drop-shadow-md">{{ selectedEpisode?.series?.title }}</h3>
              </div>
            </div>
            <div class="p-5 pt-2" dir="rtl">
              <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-[#333]">
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ selectedEpisode?.title || 'عنوان الحلقة' }}</h4>
                <div class="flex items-center gap-3 text-xs text-gray-500">
                  <span class="flex items-center gap-1"><Eye class="w-3.5 h-3.5" /> {{ selectedEpisode?.views }}</span>
                  <span class="flex items-center gap-1"><Clock class="w-3.5 h-3.5" /> 24 دقيقة</span>
                </div>
              </div>
              <p class="mb-6 text-xs leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-4">{{ selectedEpisode?.description || selectedEpisode?.series?.description || 'شاهد هذه الحلقة المميزة واستمتع بأحداث مثيرة.' }}</p>
              <button @click="goToEpisode(selectedEpisode?.id)" class="flex items-center justify-center w-full gap-2 py-3 font-bold text-white transition-all bg-indigo-600 shadow-lg hover:bg-indigo-700 rounded-xl shadow-indigo-500/30"><Play class="w-4 h-4 fill-current" /> مشاهدة الحلقة الآن</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AppLayout>
</template>

<style>
/* Skeleton - بدون أي تأخير */
.skeleton-box {
  background: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
  background-size: 200% 100%;
  animation: shimmer 1s infinite ease-in-out;
}
.dark .skeleton-box {
  background: linear-gradient(90deg, #1f1f1f 0%, #2a2a2a 50%, #1f1f1f 100%);
  background-size: 200% 100%;
}
.skeleton-box-inner { background: rgba(0, 0, 0, 0.05); }
.dark .skeleton-box-inner { background: rgba(255, 255, 255, 0.05); }
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.content-fade-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.content-fade-leave-active { transition: opacity 0.2s ease; }
.content-fade-enter-from { opacity: 0; transform: translateY(8px); }
.content-fade-leave-to { opacity: 0; }
.episode-card { opacity: 0; animation: fadeInUp 0.4s ease forwards; }
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #1a1a1a; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #4f46e5; }
</style>