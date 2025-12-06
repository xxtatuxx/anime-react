<script setup lang="ts">
import AppLayout from '@/layouts/AR-HomeLayout.vue';
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import { usePage, router as inertia, Head } from '@inertiajs/vue3';
import { Episode } from '@/types';

// ----- البيانات من السيرفر -----
const page = usePage<{
  episodes: { data: Episode[]; next_page_url?: string; current_page?: number };
  animes?: any[];
  news?: any[];
  filters?: { search?: string };
}>();

// ----- السلايدر العلوي (أخبار) -----
const slides = ref(
  page.props.news?.map((n: any) => ({
    id: n.id,
    image: n.image ? `/storage/${n.image}` : '/placeholder.jpg',
    title: n.title_ar,
    subtitle: n.subtitle_ar,
    description: n.description_ar,
    link: n.link_ar
  })) || []
);

const currentSlide = ref(0);
const sliderTrack = ref<HTMLDivElement>();
let interval: number;
let startX = 0;
let endX = 0;
let isDragging = false;
let dragStartX = 0;
let dragCurrentX = 0;
let dragOffset = 0;
const transitionEnabled = ref(true);

function nextSlide() {
  transitionEnabled.value = true;
  if (slides.value.length) currentSlide.value = (currentSlide.value + 1) % slides.value.length;
}
function prevSlide() {
  transitionEnabled.value = true;
  if (slides.value.length) currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
}
function goToSlide(index: number) {
  transitionEnabled.value = true;
  currentSlide.value = index;
}

onMounted(() => { interval = window.setInterval(nextSlide, 4000); });
onUnmounted(() => { clearInterval(interval); });

// التعامل مع Touch و Mouse
function handleTouchStart(e: TouchEvent) { transitionEnabled.value = false; startX = e.touches[0].clientX; if (sliderTrack.value) clearInterval(interval); }
function handleTouchMove(e: TouchEvent) {
  if (!sliderTrack.value) return;
  const currentX = e.touches[0].clientX;
  const diff = startX - currentX;
  const slideWidth = sliderTrack.value.offsetWidth;
  dragOffset = (-currentSlide.value * 100) - (diff / slideWidth * 100);
  sliderTrack.value.style.transform = `translateX(${dragOffset}%)`;
}
function handleTouchEnd(e: TouchEvent) {
  transitionEnabled.value = true;
  endX = e.changedTouches[0].clientX;
  const diff = startX - endX;
  if (Math.abs(diff) > 50) { if (diff > 0) nextSlide(); else prevSlide(); }  
  else { nextTick(() => { if (sliderTrack.value) sliderTrack.value.style.transform = `translateX(-${currentSlide.value * 100}%)`; }); }
  interval = window.setInterval(nextSlide, 4000);
}

function handleMouseDown(e: MouseEvent) {
  e.preventDefault(); isDragging = true; transitionEnabled.value = false; dragStartX = e.clientX;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  clearInterval(interval);
}
function handleMouseMove(e: MouseEvent) {
  if (!isDragging || !sliderTrack.value) return;
  dragCurrentX = e.clientX;
  const diff = dragStartX - dragCurrentX;
  const slideWidth = sliderTrack.value.offsetWidth;
  dragOffset = (-currentSlide.value * 100) - (diff / slideWidth * 100);
  sliderTrack.value.style.transform = `translateX(${dragOffset}%)`;
}
function handleMouseUp() {
  if (!isDragging) return;
  const diff = dragStartX - dragCurrentX;
  const slideWidth = sliderTrack.value?.offsetWidth || 0;
  const threshold = slideWidth * 0.1;
  transitionEnabled.value = true;
  if (Math.abs(diff) > threshold) { if (diff > 0) nextSlide(); else prevSlide(); }  
  else { nextTick(() => { if (sliderTrack.value) sliderTrack.value.style.transform = `translateX(-${currentSlide.value * 100}%)`; }); }
  isDragging = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  interval = window.setInterval(nextSlide, 4000);
}

// ----- حلقات Grid -----
const episodes = ref<Episode[]>(page.props.episodes.data || []);
const nextPageUrl = ref(page.props.episodes.next_page_url || null);
const currentPage = ref(page.props.episodes.current_page || 1);
const loadingMore = ref(false);
const search = ref(page.props.filters?.search || '');

// ----- فلترة الأنميات -----
const movies = computed(() => page.props.animes?.filter((anime: any) => anime.type === 'Movie') || []);
const tvAnimes = computed(() => page.props.animes?.filter((anime: any) => anime.type === 'tv') || []);

watch(search, (value) => {
  currentPage.value = 1;
  inertia.get('/ar/home', { search: value, page: currentPage.value }, {
    preserveState: true,
    preserveScroll: true,
    only: ['episodes', 'filters', 'animes'],
    onSuccess: (pageResponse) => {
      episodes.value = pageResponse.props.episodes.data;
      nextPageUrl.value = pageResponse.props.episodes.next_page_url || null;
    },
  });
});

const loadMoreEpisodes = () => {
  if (!nextPageUrl.value || loadingMore.value) return;
  loadingMore.value = true;
  currentPage.value++;
  inertia.get('/ar/home', { page: currentPage.value, search: search.value }, {
    preserveState: true,
    preserveScroll: true,
    only: ['episodes', 'animes'],
    onSuccess: (pageResponse) => {
      episodes.value.push(...pageResponse.props.episodes.data);
      nextPageUrl.value = pageResponse.props.episodes.next_page_url || null;
    },
    onFinish: () => { loadingMore.value = false; },
  });
};

// =============================================
//          ⭐ إضافات الـ Modal ⭐
// =============================================
const showModal = ref(false);
const modalTitle = ref('');
const modalDescription = ref('');

function openInfoModal(item: any) {
  if (item.series || item.episode_number !== undefined) {
    modalTitle.value = item.series?.title || 'تفاصيل الحلقة';
    modalDescription.value = item.description_ar || item.series?.description || 'لا يوجد وصف متوفر.';
  } else {
    modalTitle.value = item.title || 'لا يوجد عنوان';
    modalDescription.value = item.description || 'لا يوجد وصف متوفر.';
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}
</script>


<template>
  <Head>
    <title>Home</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap"/>
  </Head>

  <AppLayout>

    <div
      class="relative w-screen overflow-hidden cursor-grab active:cursor-grabbing select-none font-[Cairo] left-1/2 -translate-x-1/2"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
    >
      <div
        ref="sliderTrack"
        class="flex h-80 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        :style="{ transform: `translateX(-${currentSlide * 100}%)`, transition: transitionEnabled ? 'transform 500ms cubic-bezier(0.25,0.46,0.45,0.94)' : 'none' }"
      >
        <div
          v-for="slide in slides"
          :key="slide.id"
          class="relative flex-shrink-0 w-screen h-full cursor-pointer"
          @click="slide.link ? window.open(slide.link,'_blank') : null"
        >
          <img
            :src="slide.image"
            :alt="slide.title"
            class="object-cover w-full h-full pointer-events-none"
          />

          <div class="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md p-3 max-w-[80%] rounded-md text-white">
            <h2 class="mb-1 text-xl font-bold">{{ slide.title }}</h2>
            <p class="text-sm opacity-90 line-clamp-2">{{ slide.subtitle }}</p>
            <p class="mt-1 text-xs opacity-80 line-clamp-2">{{ slide.description }}</p>
          </div>
        </div>
      </div>

      <button
        @click="prevSlide"
        @mousedown.prevent
        class="absolute p-2 text-white -translate-y-1/2 rounded-full top-1/2 left-4 bg-black/50 hover:bg-black/70"
        aria-label="Previous slide"
      >‹</button>

      <button
        @click="nextSlide"
        @mousedown.prevent
        class="absolute p-2 text-white -translate-y-1/2 rounded-full top-1/2 right-4 bg-black/50 hover:bg-black/70"
        aria-label="Next slide"
      >›</button>

      <div class="absolute bottom-0 left-0 right-0 flex items-end justify-center h-12 pb-2 bg-gradient-to-t from-black/60 to-transparent">
        <div class="flex gap-2">
          <button
            v-for="(s, i) in slides"
            :key="i"
            @click="goToSlide(i)"
            @mousedown.prevent
            :class="`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white scale-110 shadow-md' : 'bg-white/40 hover:bg-white/70'}`"
            :aria-label="`Go to slide ${i + 1}`"
          ></button>
        </div>
      </div>
    </div>

    <div class="relative flex items-center justify-between px-4">
      <button class="px-4 py-2 text-white transition bg-black rounded hover:bg-gray-700 dark:bg-gray-300 dark:text-black dark:hover:bg-gray-400">View All</button>
      <h2 class="pr-2 text-2xl font-bold text-right">Latest Added Episodes</h2>
    </div>

    <div class="grid grid-cols-2 gap-4 p-4 pb-8 sm:grid-cols-3 lg:grid-cols-5">
      <div v-for="episode in episodes" :key="episode.id" class="overflow-hidden transition-transform bg-white rounded-md shadow-md dark:bg-gray-950 hover:scale-105">
        <div class="relative w-full h-40 cursor-pointer" @click="inertia.visit(`/episodes/${episode.id}`)">
          <img v-if="episode.thumbnail" :src="`/storage/${episode.thumbnail}`" class="object-cover w-full h-full rounded-t-md" alt="thumbnail"/>
          <div v-else class="flex items-center justify-center w-full h-full text-gray-500 bg-gray-200 dark:bg-gray-800">No Image</div>

          <div class="absolute bottom-0 left-0 right-0 py-1 text-lg font-bold text-center text-white bg-black/60">
            Episode {{ episode.episode_number }}
          </div>

          <div v-if="episode.is_published" class="absolute top-1 left-1 bg-green-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow">Now Airing</div>
          <div v-if="episode.video_format" class="absolute top-1 right-1 bg-blue-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow">{{ episode.video_format }}</div>
        </div>

        <div class="relative flex items-center justify-between gap-2 p-1 dark:bg-gray-900">
          <span class="text-sm font-medium text-gray-800 truncate dark:text-white">
            {{ episode.series?.title }}
          </span>

          <button 
            @click="openInfoModal(episode)" 
            class="p-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
            aria-label="Show Story"
          >
            ⋮
          </button>
          
        </div>
      </div>
    </div>

    <div v-if="loadingMore" class="flex flex-wrap gap-3 p-4 pb-8">
      <div v-for="n in 3" :key="n" class="w-40 h-48 bg-gray-300 rounded-md shadow-md dark:bg-gray-800 animate-pulse"></div>
    </div>

    <div class="relative flex items-center justify-between px-4">
      <button class="px-4 py-2 text-white transition bg-black rounded hover:bg-gray-700 dark:bg-gray-300 dark:text-black dark:hover:bg-gray-400">View All</button>
      <h2 class="pr-2 text-2xl font-bold text-right">Latest Added Movies</h2>
    </div>

    <div class="grid grid-cols-2 gap-4 p-4 pb-8 sm:grid-cols-3 lg:grid-cols-5">
      <div v-for="anime in movies" :key="anime.id" class="overflow-hidden transition-transform bg-white rounded-md shadow-md dark:bg-gray-950 hover:scale-105">
        <div class="relative w-full h-48 cursor-pointer" @click="inertia.visit(`/animes/${anime.id}`)">
          <img v-if="anime.cover" :src="`/storage/${anime.cover}`" class="object-cover w-full h-full rounded-t-md" alt="cover"/>
          <div v-else class="flex items-center justify-center w-full h-full text-gray-500 bg-gray-200 dark:bg-gray-800">No Image</div>

          <div class="absolute bottom-0 left-0 right-0 py-1 text-xl font-bold text-center text-white bg-black/60">
            Movie
          </div>
        </div>

        <div class="relative flex items-center justify-between gap-2 p-1 dark:bg-gray-900">
          <span class="text-base font-medium text-gray-800 truncate dark:text-white">
            {{ anime.title }}
          </span>

          <button 
            @click="openInfoModal(anime)" 
            class="p-1 text-xl rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
            aria-label="Show Story"
          >
            ⋮
          </button>

        </div>
      </div>
    </div>

    <div class="relative flex items-center justify-between px-4">
      <button class="px-4 py-2 text-white transition bg-black rounded hover:bg-gray-700 dark:bg-gray-300 dark:text-black dark:hover:bg-gray-400">View All</button>
      <h2 class="pr-2 text-2xl font-bold text-right">Latest Added Anime</h2>
    </div>

    <div class="grid grid-cols-2 gap-4 p-4 pb-8 sm:grid-cols-3 lg:grid-cols-5">
      <div v-for="anime in tvAnimes" :key="anime.id" class="overflow-hidden transition-transform bg-white rounded-md shadow-md dark:bg-gray-950 hover:scale-105">
        <div class="relative w-full cursor-pointer h-80" @click="inertia.visit(`/animes/${anime.id}`)">
          <img v-if="anime.cover" :src="`/storage/${anime.cover}`" class="object-cover w-full h-full rounded-t-md" alt="cover"/>
          <div v-else class="flex items-center justify-center w-full h-full text-gray-500 bg-gray-200 dark:bg-gray-800">No Image</div>

          <div class="absolute bottom-0 left-0 right-0 py-1 text-xl font-bold text-center text-white bg-black/60">
            Anime
          </div>
        </div>

        <div class="relative flex items-center justify-between gap-2 p-1 dark:bg-gray-900">
          <span class="text-base font-medium text-gray-800 truncate dark:text-white">
            {{ anime.title }}
          </span>

          <button 
            @click="openInfoModal(anime)" 
            class="p-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
            aria-label="Show Story"
          >
            ⋮
          </button>

        </div>
      </div>
    </div>

    <footer class="bg-neutral-primary-soft">
      <div class="w-full max-w-screen-xl p-4 py-6 mx-auto lg:py-8">
        <div class="md:flex md:justify-between">
          <div class="mb-6 md:mb-0">
            <a href="https://flowbite.com/" class="flex items-center">
              <img src="https://flowbite.com/docs/images/logo.svg" class="h-7 me-3" alt="FlowBite Logo" />
              <span class="self-center text-2xl font-semibold text-heading whitespace-nowrap">Flowbite</span>
            </a>
          </div>
          <div class="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 class="mb-6 text-sm font-semibold uppercase text-heading">Resources</h2>
              <ul class="font-medium text-body">
                <li class="mb-4"><a href="https://flowbite.com/" class="hover:underline">Flowbite</a></li>
                <li><a href="https://tailwindcss.com/" class="hover:underline">Tailwind CSS</a></li>
              </ul>
            </div>
            <div>
              <h2 class="mb-6 text-sm font-semibold uppercase text-heading">Follow Us</h2>
              <ul class="font-medium text-body">
                <li class="mb-4"><a href="https://github.com/themesberg/flowbite" class="hover:underline">Github</a></li>
                <li><a href="https://discord.gg/4eeurUVvTy" class="hover:underline">Discord</a></li>
              </ul>
            </div>
            <div>
              <h2 class="mb-6 text-sm font-semibold uppercase text-heading">Legal</h2>
              <ul class="font-medium text-body">
                <li class="mb-4"><a href="#" class="hover:underline">Privacy Policy</a></li>
                <li><a href="#" class="hover:underline">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
        </div>
        <hr class="my-6 border-default sm:mx-auto lg:my-8" />
        <div class="sm:flex sm:items-center sm:justify-between">
          <span class="text-sm text-body sm:text-center">© 2023 <a href="https://flowbite.com/" class="hover:underline">Flowbite™</a>. All Rights Reserved.</span>
          <div class="flex mt-4 space-x-5 sm:justify-center sm:mt-0"></div>
        </div>
      </div>
    </footer>

    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click="closeModal"
        aria-modal="true"
        role="dialog"
      >
        <Transition
          appear
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="scale-90 translate-y-3 opacity-0"
          enter-to-class="scale-100 translate-y-0 opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="scale-100 translate-y-0 opacity-100"
          leave-to-class="scale-90 translate-y-3 opacity-0"
        >
          <div 
            v-if="showModal"
            class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden"
            @click.stop 
          >
            <header class="flex items-center justify-between p-4 pr-5 border-b dark:border-gray-700">
              <button 
                @click="closeModal" 
                class="p-1.5 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-500 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label="Close"
              >
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 class="text-xl font-bold text-right text-gray-800 dark:text-gray-100">{{ modalTitle }}</h2>
            </header>
            
            <main class="p-6 overflow-y-auto">
              <p class="leading-relaxed text-right text-gray-700 whitespace-pre-line dark:text-gray-300">
                {{ modalDescription }}
              </p>
            </main>

            <footer class="flex justify-start p-4 border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
              <button 
                @click="closeModal" 
                class="px-5 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border dark:border-gray-600"
              >
                Close
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>

  </AppLayout>
</template>


<style scoped>
.left-1\/2 {
  left: 50%;
}
.-translate-x-1\/2 {
  transform: translateX(-50%);
}
</style>