<script setup lang="ts">
import AppLayout from "@/layouts/AR-HomeLayout.vue";
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import { usePage, router as inertia, Head, Link } from "@inertiajs/vue3";
import { Episode } from "@/types";

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
    image: n.image ? `/storage/${n.image}` : "/placeholder.jpg",
    title: n.title_ar,
    subtitle: n.subtitle_ar,
    description: n.description_ar,
    link: n.link_ar,
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
  if (slides.value.length)
    currentSlide.value = (currentSlide.value + 1) % slides.value.length;
}
function prevSlide() {
  transitionEnabled.value = true;
  if (slides.value.length)
    currentSlide.value =
      (currentSlide.value - 1 + slides.value.length) % slides.value.length;
}
function goToSlide(index: number) {
  transitionEnabled.value = true;
  currentSlide.value = index;
}

onMounted(() => {
  interval = window.setInterval(nextSlide, 4000);
});
onUnmounted(() => {
  clearInterval(interval);
});

function handleTouchStart(e: TouchEvent) {
  transitionEnabled.value = false;
  startX = e.touches[0].clientX;
  if (sliderTrack.value) {
    clearInterval(interval);
  }
}
function handleTouchMove(e: TouchEvent) {
  if (!sliderTrack.value) return;
  const currentX = e.touches[0].clientX;
  const diff = startX - currentX;
  const slideWidth = sliderTrack.value.offsetWidth;
  dragOffset = -currentSlide.value * 100 - (diff / slideWidth) * 100;
  sliderTrack.value.style.transform = `translateX(${dragOffset}%)`;
}
function handleTouchEnd(e: TouchEvent) {
  transitionEnabled.value = true;
  endX = e.changedTouches[0].clientX;
  const diff = startX - endX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) nextSlide();
    else prevSlide();
  } else {
    nextTick(() => {
      if (sliderTrack.value)
        sliderTrack.value.style.transform = `translateX(-${currentSlide.value * 100}%)`;
    });
  }
  interval = window.setInterval(nextSlide, 4000);
}

function handleMouseDown(e: MouseEvent) {
  e.preventDefault();
  isDragging = true;
  transitionEnabled.value = false;
  dragStartX = e.clientX;
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  clearInterval(interval);
}
function handleMouseMove(e: MouseEvent) {
  if (!isDragging || !sliderTrack.value) return;
  dragCurrentX = e.clientX;
  const diff = dragStartX - dragCurrentX;
  const slideWidth = sliderTrack.value.offsetWidth;
  dragOffset = -currentSlide.value * 100 - (diff / slideWidth) * 100;
  sliderTrack.value.style.transform = `translateX(${dragOffset}%)`;
}
function handleMouseUp() {
  if (!isDragging) return;
  const diff = dragStartX - dragCurrentX;
  const slideWidth = sliderTrack.value?.offsetWidth || 0;
  const threshold = slideWidth * 0.1;
  transitionEnabled.value = true;
  if (Math.abs(diff) > threshold) {
    if (diff > 0) nextSlide();
    else prevSlide();
  } else {
    nextTick(() => {
      if (sliderTrack.value)
        sliderTrack.value.style.transform = `translateX(-${currentSlide.value * 100}%)`;
    });
  }
  isDragging = false;
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
  interval = window.setInterval(nextSlide, 4000);
}

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

// =============================================
//          ⭐ إضافات الـ Modal ⭐
// =============================================
const showModal = ref(false);
const modalTitle = ref("");
const modalDescription = ref("");

/**
 * ⭐ دالة لفتح الـ Modal (معدلة حسب طلبك)
 * @param item - العنصر (حلقة 'episode' أو أنمي 'anime')
 */
function openInfoModal(item: any) {
  // ❗ نستخدم الحقل 'description_ar' كافتراض، قم بتغييره إذا كان اسم الحقل مختلف

  // الحالة 1: كرت حلقة (له 'series' أو 'episode_number')
  if (item.series || item.episode_number !== undefined) {
    modalTitle.value = item.series?.title || "تفاصيل الحلقة";
    // المنطق: 1. وصف الحلقة نفسها | 2. وصف المسلسل (الأنمي)
    modalDescription.value =
      item.description_ar || item.series?.description || "لا يوجد وصف متوفر.";
  }
  // الحالة 2: كرت أنمي (فيلم أو مسلسل)
  else {
    modalTitle.value = item.title || "لا يوجد عنوان";
    // المنطق: 1. وصف الأنمي
    modalDescription.value = item.description || "لا يوجد وصف متوفر.";
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}
</script>
<template>
  <Head>
    <title>الرئيسية</title>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap"
    />
  </Head>

  <AppLayout>
    <!-- شريط التمرير -->
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
        :style="{
          transform: `translateX(-${currentSlide * 100}%)`,
          transition: transitionEnabled
            ? 'transform 500ms cubic-bezier(0.25,0.46,0.45,0.94)'
            : 'none',
        }"
      >
        <div
          v-for="slide in slides"
          :key="slide.id"
          class="relative flex-shrink-0 w-screen h-full cursor-pointer"
          @click="slide.link ? window.open(slide.link, '_blank') : null"
        >
          <!-- الصورة -->
          <img
            :src="slide.image"
            :alt="slide.title"
            class="object-cover w-full h-full pointer-events-none"
          />

          <!-- إضاءة خفيفة فقط -->
          <div class="absolute inset-0 bg-black/30"></div>

          <!-- النصوص + الأزرار مباشرة فوق الصورة -->
          <div class="absolute text-white bottom-6 left-6 right-6">
            <!-- اسم الأنمي -->
            <h2 class="mb-1 text-2xl font-bold drop-shadow-md">
              {{ slide.title }}
            </h2>

            <!-- قصة الأنمي -->
            <p class="mb-3 text-sm opacity-90 line-clamp-3 drop-shadow-md">
              {{ slide.description }}
            </p>

            <!-- أزرار شاهد الآن + تفاصيل -->
            <div class="flex gap-3">
              <button
                class="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-sm rounded-md shadow-md"
                @click.stop="window.open(slide.watchLink, '_blank')"
              >
                ▶ شاهد الآن
              </button>

              <button
                class="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-sm rounded-md shadow"
                @click.stop="window.open(slide.detailsLink, '_blank')"
              >
                تفاصيل
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- السهم اليسار -->
      <button
        @click="prevSlide"
        @mousedown.prevent
        class="absolute p-2 text-white -translate-y-1/2 rounded-full top-1/2 left-4 bg-black/50 hover:bg-black/70"
        aria-label="Previous slide"
      >
        ‹
      </button>

      <!-- السهم اليمين -->
      <button
        @click="nextSlide"
        @mousedown.prevent
        class="absolute p-2 text-white -translate-y-1/2 rounded-full top-1/2 right-4 bg-black/50 hover:bg-black/70"
        aria-label="Next slide"
      >
        ›
      </button>

      <!-- النقاط -->
      <div
        class="absolute bottom-0 left-0 right-0 flex items-end justify-center h-12 pb-2 bg-gradient-to-t from-black/60 to-transparent"
      >
        <div class="flex gap-2">
          <button
            v-for="(s, i) in slides"
            :key="i"
            @click="goToSlide(i)"
            @mousedown.prevent
            :class="`w-2 h-2 rounded-full transition-all ${
              i === currentSlide
                ? 'bg-white scale-110 shadow-md'
                : 'bg-white/40 hover:bg-white/70'
            }`"
            :aria-label="`Go to slide ${i + 1}`"
          ></button>
        </div>
      </div>
    </div>

    <!-- شبكة الحلقات -->

    <!-- حلقات فوق بعض -->
    <div class="relative flex items-center justify-between px-4 mt-4">
      <Link
        href="/your-route"
        class="font-bold text-purple-600 underline dark:text-white"
      >
        عرض الكل
      </Link>

      <h2 class="pr-2 text-2xl font-bold text-right text-gray-800 dark:text-white">
        أحدث الحلقات المضافة
      </h2>
    </div>

    <!-- عمودين -->
    <div dir="rtl" class="grid grid-cols-1 gap-4 p-4 pb-8 md:grid-cols-2">
      <div
        @click="inertia.visit(`/ar/episodes/${episode.id}`)"
        v-for="episode in episodes"
        :key="episode.id"
        class="flex gap-4 p-3 transition-transform bg-white dark:bg-[#171717] rounded-md shadow-md hover:scale-[1.02]"
      >
        <!-- الصورة يمين -->
        <div class="relative w-32 h-24 cursor-pointer min-w-32">
          <img
            v-if="episode.thumbnail"
            :src="`/storage/${episode.thumbnail}`"
            class="object-cover w-full h-full rounded-md"
            alt="صورة مصغرة"
          />

          <div
            v-else
            class="flex items-center justify-center w-full h-full text-gray-500 bg-gray-200 rounded-md dark:text-gray-300 dark:bg-gray-800"
          >
            لا توجد صورة
          </div>

          <!-- رقم الحلقة -->
          <div
            class="absolute bottom-0 left-0 right-0 py-1 text-sm font-bold text-center text-white bg-black/60"
          >
            الحلقة {{ episode.episode_number }}
          </div>
        </div>

        <!-- البيانات يسار -->
        <div class="flex flex-col justify-between flex-1">
          <h3 class="font-bold text-black dark:text-white">
            {{ episode.series?.title }}
          </h3>

          <!-- قصة الأنمي -->
          <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {{ episode.series?.description ?? "لا توجد قصة لهذا الأنمي." }}
          </p>

          <!-- جديد + يعرض الآن (تحت القصة) -->
          <div class="flex items-center gap-2 mt-1">
            <span
              v-if="episode.is_published"
              class="bg-green-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow"
            >
              جديد
            </span>

            <span
              v-if="episode.is_published"
              class="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow"
            >
              يُعرض الآن
            </span>
          </div>

          <div class="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            رقم الحلقة: {{ episode.episode_number }}
          </div>
        </div>
      </div>
    </div>

    <!-- شبكة الأفلام -->
    <div class="relative flex items-center justify-between px-4">
      <Link
        href="/your-route"
        class="font-bold text-purple-600 underline dark:text-white"
      >
        عرض الكل
      </Link>

      <h2 class="pr-2 text-2xl font-bold text-right text-gray-800 dark:text-white">
        أحدث الأفلام المضافة
      </h2>
    </div>

    <div class="grid grid-cols-2 gap-4 p-4 pb-8 sm:grid-cols-3 lg:grid-cols-5">
      <div
        v-for="anime in movies"
        :key="anime.id"
        class="overflow-hidden transition-transform bg-white dark:bg-[#171717] rounded-md shadow-md hover:scale-105"
      >
        <div
          class="relative w-full cursor-pointer h-72"
          @click="inertia.visit(`/animes/${anime.id}`)"
        >
          <img
            v-if="anime.cover"
            :src="`/storage/${anime.cover}`"
            class="object-cover w-full h-full rounded-t-md"
            alt="غلاف"
          />
          <div
            v-else
            class="flex items-center justify-center w-full h-full text-gray-500 bg-gray-200 dark:text-gray-300 dark:bg-gray-800"
          >
            لا توجد صورة
          </div>

          <div
            class="absolute bottom-0 left-0 right-0 py-1 text-xl font-bold text-center text-white bg-black/60"
          >
            Movie
          </div>
        </div>

        <div
          class="relative flex items-center justify-between gap-2 p-1 bg-white dark:bg-[#171717]"
        >
          <span class="text-base font-medium text-black truncate dark:text-white">
            {{ anime.title }}
          </span>
        </div>
      </div>
    </div>

    <!-- شبكة أنمي التلفاز -->
    <div class="relative flex items-center justify-between px-4">
      <Link
        href="/your-route"
        class="font-bold text-purple-600 underline dark:text-white"
      >
        عرض الكل
      </Link>
      <h2 class="pr-2 text-2xl font-bold text-right text-gray-800 dark:text-white">
        أحدث الأنميات المضافة
      </h2>
    </div>

    <div class="grid grid-cols-2 gap-4 p-4 pb-8 sm:grid-cols-3 lg:grid-cols-5">
      <div
        v-for="anime in tvAnimes"
        :key="anime.id"
        class="overflow-hidden transition-transform bg-white dark:bg-[#171717] rounded-md shadow-md hover:scale-105"
      >
        <div
          class="relative w-full cursor-pointer h-80"
          @click="inertia.visit(`/animes/${anime.id}`)"
        >
          <img
            v-if="anime.cover"
            :src="`/storage/${anime.cover}`"
            class="object-cover w-full h-full rounded-t-md"
            alt="غلاف"
          />
          <div
            v-else
            class="flex items-center justify-center w-full h-full text-gray-500 bg-gray-200 dark:text-gray-300 dark:bg-gray-800"
          >
            لا توجد صورة
          </div>

          <div
            class="absolute bottom-0 left-0 right-0 py-1 text-xl font-bold text-center text-white bg-black/60"
          >
            TV
          </div>
        </div>

        <div
          class="relative flex items-center justify-between gap-2 p-1 bg-white dark:bg-[#171717]"
        >
          <span class="text-base font-medium text-black truncate dark:text-white">
            {{ anime.title }}
          </span>
        </div>
      </div>
    </div>

    <!-- التذييل -->
    <footer class="bg-neutral-primary-soft">
      <div class="w-full max-w-screen-xl p-4 py-6 mx-auto lg:py-8">
        <div class="md:flex md:justify-between">
          <div class="mb-6 md:mb-0">
            <a href="https://flowbite.com/" class="flex items-center">
              <img
                src="https://flowbite.com/docs/images/logo.svg"
                class="h-7 me-3"
                alt="شعار FlowBite"
              />
              <span
                class="self-center text-2xl font-semibold text-heading whitespace-nowrap"
                >ANIME LAST</span
              >
            </a>
          </div>
          <div class="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 class="mb-6 text-sm font-semibold uppercase text-heading">الموارد</h2>
              <ul class="font-medium text-body">
                <li class="mb-4">
                  <a href="https://flowbite.com/" class="hover:underline">Flowbite</a>
                </li>
                <li>
                  <a href="https://tailwindcss.com/" class="hover:underline"
                    >Tailwind CSS</a
                  >
                </li>
              </ul>
            </div>
            <div>
              <h2 class="mb-6 text-sm font-semibold uppercase text-heading">تابعنا</h2>
              <ul class="font-medium text-body">
                <li class="mb-4">
                  <a href="https://github.com/themesberg/flowbite" class="hover:underline"
                    >Github</a
                  >
                </li>
                <li>
                  <a href="https://discord.gg/4eeurUVvTy" class="hover:underline"
                    >Discord</a
                  >
                </li>
              </ul>
            </div>
            <div>
              <h2 class="mb-6 text-sm font-semibold uppercase text-heading">القانونية</h2>
              <ul class="font-medium text-body">
                <li class="mb-4">
                  <a href="#" class="hover:underline">سياسة الخصوصية</a>
                </li>
                <li><a href="#" class="hover:underline">الشروط والأحكام</a></li>
              </ul>
            </div>
          </div>
        </div>
        <hr class="my-6 border-default sm:mx-auto lg:my-8" />
        <div class="sm:flex sm:items-center sm:justify-between">
          <span class="text-sm text-body sm:text-center"
            >© 2023 <a href="https://flowbite.com/" class="hover:underline">Flowbite™</a>.
            جميع الحقوق محفوظة.</span
          >
          <div class="flex mt-4 space-x-5 sm:justify-center sm:mt-0"></div>
        </div>
      </div>
    </footer>
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
