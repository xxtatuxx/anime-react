<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import axios from 'axios';
import { Home, CalendarClock, Tv, Film, PlayCircle } from 'lucide-vue-next';

import AppLogo from '@/components/AppLogo.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import type { BreadcrumbItem, NavItem } from '@/types';

// Import new components
import MobileMenu from './appheader-components/MobileMenu.vue';
import DesktopNavigation from './appheader-components/DesktopNavigation.vue';
import SearchBar from './appheader-components/SearchBar.vue';
import ThemeToggle from './appheader-components/ThemeToggle.vue';
import WatchLaterDropdown from './appheader-components/WatchLaterDropdown.vue';
import HistoryDropdown from './appheader-components/HistoryDropdown.vue';
import NotificationsDropdown from './appheader-components/NotificationsDropdown.vue';
import UserDropdown from './appheader-components/UserDropdown.vue';

interface Props {
  breadcrumbs?: BreadcrumbItem[];
}

const props = withDefaults(defineProps<Props>(), { breadcrumbs: () => [] });
const page = usePage();
const auth = computed(() => page.props.auth);

// آخر أنمي TV وآخر Movie وآخر حلقة يتم جلبها من Route
const latestAnime = ref<{ latest_tv?: any; latest_movie?: any; latest_episode?: any }>({});

// ✅ كاش محلي في المتصفح - لا يتم طلب البيانات إلا مرة واحدة في الجلسة
const CACHE_KEY = 'latest_anime_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 دقائق

onMounted(async () => {
  try {
    // التحقق من الكاش المحلي أولاً
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // إذا الكاش لا يزال صالح (أقل من 10 دقائق)
      if (Date.now() - timestamp < CACHE_DURATION) {
        latestAnime.value = data;
        return; // لا حاجة لطلب API
      }
    }
    
    // إذا لا يوجد كاش أو منتهي الصلاحية، جلب من السيرفر
    const res = await axios.get('/latest-tv-anime');
    latestAnime.value = res.data;
    
    // حفظ في الكاش المحلي
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      data: res.data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Failed to fetch latest anime', e);
    latestAnime.value = {};
  }
});

// الروابط للقائمة الجانبية (Mobile) والقائمة المنسدلة
const mainNavItems: NavItem[] = [
  { title: 'الرئيسية', href: '/ar/home', icon: Home },
  { title: 'أنمي القادم', href: '/ar/coming-soon', icon: CalendarClock },
  { title: 'قائمة مسلسلات - TV', href: '/ar/anime', icon: Tv },
  { title: 'قائمة الأفلام - Movies', href: '/ar/movies', icon: Film },
  { title: 'قائمة الحلقات - Episodes', href: '/ar/episodes-list', icon: PlayCircle },
];

const isMobileSearchOpen = ref(false);

</script>

<template>
<div>
  <div dir="rtl" class="fixed top-0 left-0 z-50 w-full transition-colors duration-300 border-b bg-white/95 backdrop-blur-md border-sidebar-border/80 dark:bg-black/95 dark:border-neutral-800">
    <div class="relative flex items-center h-20 px-4 mx-auto md:max-w-[1600px]">

      <!-- Mobile Menu -->
      <MobileMenu :mainNavItems="mainNavItems" :latestAnime="latestAnime" />

      <!-- Logo -->
      <Link :href="route('ar.home')" class="flex items-center mr-4 transition-transform gap-x-2 hover:scale-105">
        <AppLogo class="w-auto h-8" />
      </Link>

      <!-- Desktop Navigation -->
      <DesktopNavigation :mainNavItems="mainNavItems" :latestAnime="latestAnime" />

      <div class="flex items-center gap-2 ml-auto lg:gap-3">
        
        <!-- Search Bar -->
        <SearchBar v-model:isOpen="isMobileSearchOpen" />

        <!-- Icons Container (Hidden when mobile search is open) -->
        <div v-show="!isMobileSearchOpen" class="flex items-center gap-2 lg:gap-3">
            
            <ThemeToggle />
    
            <WatchLaterDropdown v-if="auth?.user" />
    
            <HistoryDropdown v-if="auth?.user" />
    
            <NotificationsDropdown v-if="auth?.user" />
    
            <UserDropdown :auth="auth" />

        </div>

      </div>
    </div>
  </div>

  <div class="pt-20"></div>

  <div v-if="props.breadcrumbs.length > 1" class="flex w-full border-b border-gray-100 dark:border-neutral-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
    <div class="flex items-center justify-start w-full h-10 px-4 mx-auto text-neutral-500 md:max-w-[1600px]">
      <Breadcrumbs :breadcrumbs="breadcrumbs" />
    </div>
  </div>
</div>
</template>