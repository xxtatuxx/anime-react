<script setup lang="ts">
import AppLogo from '@/components/AppLogo.vue';
import AppLogoIcon from '@/components/AppLogoIcon.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { User, LogIn, UserPlus } from "lucide-vue-next";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import UserMenuContent from '@/components/UserMenuContent.vue';
import { getInitials } from '@/composables/useInitials';
import type { BreadcrumbItem, NavItem } from '@/types';
import { Link, usePage, router as inertia } from '@inertiajs/vue3';
import { useInitials } from '@/composables/useInitials';

import { 
    BookOpen, 
    Folder, 
    Menu, 
    Home, 
    Sparkles, 
    ChevronDown,
    Tv,
    Film,
    PlayCircle,
    Search,
    CalendarClock,
    Bell,        // Notifications icon
    History,     // History icon
    Clock,       // Watch Later icon
    Moon,        // Dark mode icon
    Sun,         // Light mode icon
    Loader2,     // Loading spinner icon
    X,           // Close or delete button
    MoreVertical // Additional options
} from 'lucide-vue-next';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Input } from '@/components/ui/input';
import axios from 'axios';

interface Props {
  breadcrumbs?: BreadcrumbItem[];
}

// Function to return the correct avatar image path
const getAvatarUrl = (avatar: string) => {
  // If the name already contains the avatars folder
  if (avatar.startsWith('avatars/')) {
    return `/storage/${avatar}`;
  }
  // If it's just a filename
  return `/storage/avatars/${avatar}`;
};

const props = withDefaults(defineProps<Props>(), { breadcrumbs: () => [] });
const page = usePage();
const auth = computed(() => page.props.auth);

// --- Dark and Light mode management ---
const isDarkMode = ref(false);

const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    if (isDarkMode.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
};

// Initialize theme on load
onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        isDarkMode.value = true;
        document.documentElement.classList.add('dark');
    }
});

// --- Notifications management ---
const notifications = ref<any[]>([]);
const loadingNotifications = ref(false);

const handleOpenNotifications = async (isOpen: boolean) => {
    if (isOpen) {
        loadingNotifications.value = true;
        notifications.value = []; // Clear the list
        
        // Simulate server request (replace with axios.get('/api/notifications'))
        setTimeout(() => {
            notifications.value = [
                { id: 1, title: 'New episode added: One Piece 1090', time: '2 minutes ago', image: '/storage/anime/one-piece.jpg', read: false },
                { id: 2, title: 'A moderator replied to your comment', time: '1 hour ago', image: null, icon: 'msg', read: true },
                { id: 3, title: 'New Demon Slayer movie is now available', time: '3 hours ago', image: '/storage/anime/ds-movie.jpg', read: false },
                { id: 4, title: 'New security update for your account', time: 'Yesterday', image: null, icon: 'system', read: true },
            ];
            loadingNotifications.value = false;
        }, 1500); // 1.5 second delay to show spinner
    }
};

// --- Watch history management ---
const watchHistory = ref<any[]>([]);
const loadingHistory = ref(false);

const handleOpenHistory = async (isOpen: boolean) => {
    if (isOpen) {
        loadingHistory.value = true;
        watchHistory.value = [];

        // Simulate server request
        setTimeout(() => {
            watchHistory.value = [
                { id: 101, title: 'Jujutsu Kaisen Season 2', episode: 'Episode 14', progress: 80, image: 'https://cdn.myanimelist.net/images/anime/1792/138022.jpg' },
                { id: 102, title: 'Spy x Family', episode: 'Episode 5', progress: 30, image: 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg' },
                { id: 103, title: 'Dr. Stone: New World', episode: 'Episode 9', progress: 100, image: 'https://cdn.myanimelist.net/images/anime/1105/133642.jpg' },
            ];
            loadingHistory.value = false;
        }, 1200);
    }
};

// --- Watch Later management ---
const watchLater = ref<any[]>([]);
const loadingWatchLater = ref(false);

const handleOpenWatchLater = async (isOpen: boolean) => {
    if (isOpen) {
        loadingWatchLater.value = true;
        watchLater.value = [];

        // Simulate server request
        setTimeout(() => {
            watchLater.value = [
                { id: 201, title: 'Attack on Titan: The Final Season', type: 'TV', image: 'https://cdn.myanimelist.net/images/anime/1000/110531.jpg' },
                { id: 202, title: 'Your Name (Kimi no Na wa)', type: 'Movie', image: 'https://cdn.myanimelist.net/images/anime/5/87048.jpg' },
            ];
            loadingWatchLater.value = false;
        }, 1000);
    }
};

// --- Original remaining code ---

// Latest TV anime, latest movie, and latest episode fetched from route
const latestAnime = ref<{ latest_tv?: any; latest_movie?: any; latest_episode?: any }>({});

// Fetch data on page load
onMounted(async () => {
  try {
    const res = await axios.get('/latest-tv-anime');
    latestAnime.value = res.data;
  } catch (e) {
    console.error('Failed to fetch latest anime', e);
    latestAnime.value = {};
  }
});

// Sidebar links (Mobile) and dropdown menu
const mainNavItems: NavItem[] = [
  { title: 'Home', href: '/en/home', icon: Home },
  { title: 'Coming Soon Anime', href: '/en/coming-soon', icon: CalendarClock },
  { title: 'TV Series List', href: '/en/anime', icon: Tv },
  { title: 'Movies List', href: '/en/movies', icon: Film },
  { title: 'Episodes List', href: '/en/episodes-list', icon: PlayCircle },
];


// Right-side links (reduced since we added new buttons)
const rightNavItems: NavItem[] = []; // Left empty as new icons are added directly in the template

// Search Logic
const searchQuery = ref('');
const dropdownOpen = ref(false);
const searchResults = ref<{ animes: any[]; episodes: any[] }>({ animes: [], episodes: [] });
const searching = ref(false);

watch(searchQuery, async (val) => {
  if (val.length < 1) {
    dropdownOpen.value = false;
    searchResults.value = { animes: [], episodes: [] };
    return;
  }
  searching.value = true;
  dropdownOpen.value = true;

  try {
    const res = await axios.get(route('search'), { params: { q: val } });
    searchResults.value = res.data.searchResults || { animes: [], episodes: [] };
  } catch (e) {
    searchResults.value = { animes: [], episodes: [] };
  } finally {
    searching.value = false;
  }
});

const goToAnime = (id: number) => inertia.visit(route('en.animes.show', id));
const goToEpisode = (id: number) => inertia.visit(route('en.episodes.show', id));

const searchWrapper = ref<HTMLElement | null>(null);
const isMobileSearchOpen = ref(false); // Mobile search state

const handleClickOutside = (event: MouseEvent) => {
  if (searchWrapper.value && !searchWrapper.value.contains(event.target as Node)) {
    // Only close dropdown, don't close mobile search overlay automatically on click inside
    dropdownOpen.value = false;
  }
};
onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>


<template>
<div>
  <div  class="fixed top-0 left-0 z-50 w-full transition-colors duration-300 border-b bg-white/95 backdrop-blur-md border-sidebar-border/80 dark:bg-black/95 dark:border-neutral-800">
    <div class="relative flex items-center h-20 px-4 mx-auto md:max-w-[1600px]">

      <div class="lg:hidden">
        <Sheet>
          <SheetTrigger :as-child="true">
            <Button variant="ghost" size="icon" class="w-10 h-10 mr-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"><Menu class="w-6 h-6" /></Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-[300px] p-0 bg-white dark:bg-[#0a0a0a] border-r border-neutral-200 dark:border-neutral-800">
            <SheetTitle class="sr-only">Navigation Menu</SheetTitle>
            <SheetHeader class="flex justify-start p-6 text-left border-b border-neutral-100 dark:border-neutral-800">
              <div class="flex items-center gap-2">
                  <AppLogoIcon class="text-indigo-600 fill-current size-8 dark:text-indigo-500" />
                  <span class="font-bold text-gray-900 text-lX dark:text-white">ANIME LAST</span>
              </div>
            </SheetHeader>
            
            <div class="flex flex-col justify-between flex-1 h-full p-4 overflow-y-auto">
              <nav class="space-y-2">
                <Link v-for="item in mainNavItems" :key="item.title" :href="item.href"
                      :class="['flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200', 
                               item.href === $page.url ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800']">

                  <div class="flex items-center gap-3">
                    <component v-if="item.icon" :is="item.icon" class="w-5 h-5"/>
                    {{ item.title }}
                  </div>

                  <template v-if="item.title.includes('TV') && latestAnime.latest_tv">
                      <img v-if="latestAnime.latest_tv.image"
                           :src="latestAnime.latest_tv.image.includes('http') ? latestAnime.latest_tv.image : `/storage/${latestAnime.latest_tv.image}`"
                           class="object-cover w-8 h-8 border border-gray-200 rounded-md dark:border-gray-700"/>
                  </template>

                  <template v-if="item.title.includes('Movies') && latestAnime.latest_movie">
                      <img v-if="latestAnime.latest_movie.image"
                           :src="latestAnime.latest_movie.image.includes('http') ? latestAnime.latest_movie.image : `/storage/${latestAnime.latest_movie.image}`"
                           class="object-cover w-8 h-8 border border-gray-200 rounded-md dark:border-gray-700"/>
                  </template>

                  <template v-if="item.title.includes('Episodes') && latestAnime.latest_episode">
                      <img v-if="latestAnime.latest_episode.thumbnail"
                           :src="latestAnime.latest_episode.thumbnail.includes('http') ? latestAnime.latest_episode.thumbnail : `/storage/${latestAnime.latest_episode.thumbnail}`"
                           class="object-cover w-8 h-8 border border-gray-200 rounded-md dark:border-gray-700"/>
                  </template>
                </Link>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Link :href="route('en.home')" class="flex items-center mr-4 transition-transform gap-x-2 hover:scale-105">
        <AppLogo class="w-auto h-8" />
      </Link>

      <div class="items-center hidden h-full gap-2 ml-6 lg:flex lg:flex-1">
        
        <Link href="/en/home" 
              class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 transition-all duration-200 rounded-full dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
           <Home class="w-4 h-4" />
           <span>Home</span>
        </Link>

        <Link href="/ar/coming-soon" 
              class="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white transition-all duration-300 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105">
           <Sparkles class="w-4 h-4 animate-pulse" />
           <span>Coming Soon</span>
        </Link>

        <div class="relative flex items-center ml-2 group">
          <button class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
            <span>Menu</span>
            <ChevronDown class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
          </button>

          <div class="absolute right-0 z-50 invisible pt-4 transition-all duration-200 translate-y-2 opacity-0 top-full w-80 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
             <div class="bg-white dark:bg-[#111] border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
                <div class="p-2 space-y-1">
                  <div v-for="item in mainNavItems" :key="item.title">
                    <Link v-if="!['الرئيسية', 'أنمي القادم'].includes(item.title)" 
                          :href="item.href" 
                          class="flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 dark:text-gray-300 dark:hover:text-white group/item">
                      
                      <div class="flex items-center gap-3">
                        <div class="p-2 transition-colors bg-gray-100 rounded-lg dark:bg-neutral-900 group-hover/item:bg-indigo-50 dark:group-hover/item:bg-indigo-900/20">
                            <component v-if="item.icon" :is="item.icon" class="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover/item:text-indigo-500"/>
                        </div>
                        <span>{{ item.title }}</span>
                      </div>

                      <template v-if="item.title.includes('TV') && latestAnime.latest_tv">
                          <img v-if="latestAnime.latest_tv.image" :src="latestAnime.latest_tv.image.includes('http') ? latestAnime.latest_tv.image : `/storage/${latestAnime.latest_tv.image}`" class="object-cover w-8 h-8 transition-opacity rounded-md opacity-80 group-hover/item:opacity-100"/>
                      </template>
                      <template v-if="item.title.includes('Movies') && latestAnime.latest_movie">
                          <img v-if="latestAnime.latest_movie.image" :src="latestAnime.latest_movie.image.includes('http') ? latestAnime.latest_movie.image : `/storage/${latestAnime.latest_movie.image}`" class="object-cover w-8 h-8 transition-opacity rounded-md opacity-80 group-hover/item:opacity-100"/>
                      </template>
                      <template v-if="item.title.includes('Episodes') && latestAnime.latest_episode">
                          <img v-if="latestAnime.latest_episode.thumbnail" :src="latestAnime.latest_episode.thumbnail.includes('http') ? latestAnime.latest_episode.thumbnail : `/storage/${latestAnime.latest_episode.thumbnail}`" class="object-cover w-8 h-8 transition-opacity rounded-md opacity-80 group-hover/item:opacity-100"/>
                      </template>
                    </Link>
                  </div>
                </div>
             </div>
          </div>
        </div>

      </div>

      <div class="flex items-center gap-2 ml-auto lg:gap-3">
        
        <!-- Mobile Search Button (Visible only when search is closed) -->
        <Button v-if="!isMobileSearchOpen" variant="ghost" size="icon" class="w-12 h-12 text-gray-700 rounded-full md:hidden dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800" @click="isMobileSearchOpen = true">
            <Search class="w-8 h-8" />
        </Button>

        <!-- Search Overlay (Visible when search is open) -->
        <div ref="searchWrapper" :class="['transition-all duration-300', isMobileSearchOpen ? 'fixed inset-0 z-[60] flex items-start pt-4 justify-center bg-white/95 backdrop-blur-md dark:bg-black/95 px-4' : 'relative hidden md:block w-64 lg:w-72 xl:w-80']">
          
          <div class="relative flex items-center w-full max-w-2xl gap-2 mx-auto mt-2 md:max-w-none md:mx-0 md:mt-0">
             <div class="relative flex-1">
                <Search class="absolute w-5 h-5 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                <Input v-model="searchQuery" placeholder="بحث..." class="w-full h-12 pl-4 pr-12 text-base transition-all border-gray-200 rounded-full bg-gray-50 dark:bg-neutral-900 dark:border-neutral-800 focus:ring-2 focus:ring-indigo-500 md:h-10 md:text-sm md:pr-10" @focus="dropdownOpen = true"/>
             </div>
             <!-- Close Button for Mobile Search (Next to Input) -->
             <Button v-if="isMobileSearchOpen" variant="ghost" size="icon" class="w-10 h-10 bg-gray-100 rounded-full md:hidden shrink-0 dark:bg-neutral-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500" @click="isMobileSearchOpen = false">
                  <X class="w-5 h-5" />
             </Button>
          </div>
          
          <div v-if="dropdownOpen" class="absolute right-0 z-50 w-full mt-14 md:mt-2 overflow-hidden bg-white dark:bg-[#111] border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-2xl max-h-[calc(100vh-100px)] md:max-h-[400px] overflow-y-auto">
            <div v-if="searching" class="p-4 text-sm text-center text-gray-500">
                <Loader2 class="w-5 h-5 mx-auto animate-spin" />
            </div>
            <div v-else>
                <div v-if="searchResults.animes.length" class="p-2">
                  <h4 class="px-3 py-2 text-xs font-bold tracking-wider text-gray-400 uppercase">أنميات</h4>
                  <div v-for="anime in searchResults.animes" :key="anime.id"
                       class="flex items-center gap-3 p-2 transition-colors cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800"
                       @click="goToAnime(anime.id)">
                    <img v-if="anime.image" :src="anime.image.includes('http') ? anime.image : `/storage/${anime.image}`" class="object-cover w-10 h-10 rounded-lg" />
                    <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ anime.title }}</span>
                  </div>
                </div>
                <div v-if="searchResults.episodes.length" class="p-2 border-t border-gray-50 dark:border-neutral-800">
                  <h4 class="px-3 py-2 text-xs font-bold tracking-wider text-gray-400 uppercase">حلقات</h4>
                  <div v-for="ep in searchResults.episodes" :key="ep.id"
                       class="flex items-center gap-3 p-2 transition-colors cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800"
                       @click="goToEpisode(ep.id)">
                    <img v-if="ep.thumbnail" :src="ep.thumbnail.includes('http') ? ep.thumbnail : `/storage/${ep.thumbnail}`" class="object-cover w-10 h-10 rounded-lg" />
                    <div class="flex flex-col">
                        <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ ep.title }}</span>
                        <span class="text-xs text-gray-500">حلقة {{ ep.episode_number }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="!searching && searchResults.animes.length === 0 && searchResults.episodes.length === 0" class="p-8 text-sm text-center text-gray-500">
                  لا توجد نتائج مطابقة
                </div>
            </div>
          </div>
        </div>

        <!-- Icons Container (Hidden when mobile search is open) -->
        <div v-show="!isMobileSearchOpen" class="flex items-center gap-2 lg:gap-3">
            <TooltipProvider :delay-duration="0">
                <Tooltip>
                    <TooltipTrigger as-child>
                        <Button variant="ghost" size="icon" @click="toggleTheme" class="w-12 h-12 text-gray-700 rounded-full dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
                            <Sun v-if="!isDarkMode" class="w-8 h-8" />
                            <Moon v-else class="w-8 h-8" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>الوضع {{ isDarkMode ? 'النهاري' : 'الليلي' }}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
    
            <DropdownMenu v-if="auth?.user" @update:open="handleOpenWatchLater">
                <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="w-12 h-12 text-gray-700 rounded-full dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
                        <Clock class="w-8 h-8" />
                        
                    </Button>
                </DropdownMenuTrigger>
    
                <DropdownMenuContent  align="end" class="w-80 md:w-96 p-0 bg-white dark:bg-[#111] border-gray-100 dark:border-neutral-800 shadow-2xl rounded-2xl">
                    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                        <h3 class="font-bold text-gray-900 dark:text-white">المشاهدة لاحقاً</h3>
                        <Link href="/watch-later" class="text-xs text-indigo-600 hover:underline dark:text-indigo-400">عرض الكل</Link>
                    </div>
                    
                    <div class="max-h-[350px] overflow-y-auto min-h-[150px]">
                        <div v-if="loadingWatchLater" class="flex items-center justify-center h-40">
                             <Loader2 class="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                        <div v-else-if="watchLater.length === 0" class="flex flex-col items-center justify-center h-40 gap-2 text-gray-500">
                            <Clock class="w-8 h-8 opacity-20" />
                            <span class="text-sm">القائمة فارغة</span>
                        </div>
                        <div v-else class="p-2 space-y-1">
                            <div v-for="item in watchLater" :key="item.id" class="relative flex gap-3 p-2 transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-900 group">
                                <div class="relative w-24 overflow-hidden rounded-lg shrink-0 h-14">
                                    <img :src="item.image" class="object-cover w-full h-full" />
                                    <div class="absolute inset-0 bg-black/10"></div>
                                </div>
                                <div class="flex flex-col justify-center flex-1 min-w-0">
                                    <span class="text-sm font-semibold text-gray-800 truncate dark:text-gray-200">{{ item.title }}</span>
                                    <span class="text-xs text-gray-500">{{ item.type }}</span>
                                </div>
                                <Button variant="ghost" size="icon" class="absolute w-6 h-6 transition-opacity rounded-full opacity-0 left-2 top-2 group-hover:opacity-100 bg-white/80 dark:bg-black/80 hover:bg-red-500 hover:text-white">
                                    <X class="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
    
            <DropdownMenu v-if="auth?.user" @update:open="handleOpenHistory">
                <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="w-12 h-12 text-gray-700 rounded-full dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
                        <History class="w-8 h-8" />
                    </Button>
                </DropdownMenuTrigger>
    
                <DropdownMenuContent align="end" class="w-80 md:w-96 p-0 bg-white dark:bg-[#111] border-gray-100 dark:border-neutral-800 shadow-2xl rounded-2xl">
                     <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                        <h3 class="font-bold text-gray-900 dark:text-white">سجل المشاهدة</h3>
                        <Link href="/history" class="text-xs text-indigo-600 hover:underline dark:text-indigo-400">عرض السجل بالكامل</Link>
                    </div>
    
                    <div class="max-h-[350px] overflow-y-auto min-h-[150px]">
                        <div v-if="loadingHistory" class="flex items-center justify-center h-40">
                             <Loader2 class="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                        <div v-else-if="watchHistory.length === 0" class="flex flex-col items-center justify-center h-40 gap-2 text-gray-500">
                            <History class="w-8 h-8 opacity-20" />
                            <span class="text-sm">لم تشاهد شيئاً مؤخراً</span>
                        </div>
                        <div v-else class="p-2 space-y-1">
                            <div v-for="item in watchHistory" :key="item.id" class="flex gap-3 p-2 transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-900 group">
                                 <div class="relative h-16 overflow-hidden bg-gray-200 rounded-lg shrink-0 w-28 dark:bg-neutral-800">
                                    <img :src="item.image" class="object-cover w-full h-full" />
                                    <div class="absolute bottom-0 left-0 h-1 bg-red-600" :style="{ width: item.progress + '%' }"></div>
                                    <div class="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 bg-black/30">
                                        <PlayCircle class="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div class="flex flex-col justify-center flex-1 min-w-0">
                                    <span class="text-sm font-semibold text-gray-800 truncate dark:text-gray-200" :title="item.title">{{ item.title }}</span>
                                    <span class="text-xs text-gray-500">{{ item.episode }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
    
            <DropdownMenu v-if="auth?.user" @update:open="handleOpenNotifications">
                <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="relative w-12 h-12 text-gray-700 rounded-full dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
                        <Bell class="w-8 h-8" />
                        <span class="absolute top-3 right-3 flex w-2.5 h-2.5">
                          <span class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-rose-400"></span>
                          <span class="relative inline-flex w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        </span>
                    </Button>
                </DropdownMenuTrigger>
    
                <DropdownMenuContent align="end" class="w-80 md:w-[400px] p-0 bg-white dark:bg-[#111] border-gray-100 dark:border-neutral-800 shadow-2xl rounded-2xl">
                    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                        <h3 class="font-bold text-gray-900 dark:text-white">الإشعارات</h3>
                        <button class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800">
                            <MoreVertical class="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
    
                    <div class="max-h-[400px] overflow-y-auto min-h-[200px] custom-scrollbar">
                        <div v-if="loadingNotifications" class="flex items-center justify-center h-40">
                             <Loader2 class="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                        <div v-else-if="notifications.length === 0" class="flex flex-col items-center justify-center h-40 gap-2 text-gray-500">
                            <Bell class="w-8 h-8 opacity-20" />
                            <span class="text-sm">لا توجد إشعارات جديدة</span>
                        </div>
                        <div v-else class="py-2">
                            <div v-for="notif in notifications" :key="notif.id" 
                                 class="relative flex gap-4 px-4 py-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-900/50 group"
                                 :class="{'bg-indigo-50/50 dark:bg-indigo-900/10': !notif.read}">
                                
                                <div class="shrink-0">
                                    <div v-if="notif.image" class="w-12 h-12 overflow-hidden border border-gray-100 rounded-full dark:border-neutral-800">
                                        <img :src="notif.image" class="object-cover w-full h-full" />
                                    </div>
                                    <div v-else class="flex items-center justify-center w-12 h-12 text-indigo-600 bg-indigo-100 rounded-full dark:bg-neutral-800 dark:text-indigo-400">
                                        <Bell class="w-5 h-5" />
                                    </div>
                                </div>
    
                                <div class="flex flex-col flex-1 min-w-0 gap-1">
                                    <p class="text-sm font-medium leading-snug text-gray-900 dark:text-gray-100 line-clamp-2">
                                        {{ notif.title }}
                                    </p>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ notif.time }}</span>
                                </div>
    
                                <div v-if="!notif.read" class="absolute w-2 h-2 -translate-y-1/2 bg-indigo-500 rounded-full top-1/2 left-2"></div>
                            </div>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
    
         <div>
  <!-- زر المستخدم مسجّل الدخول -->

<DropdownMenu v-if="auth?.user">
  <DropdownMenuTrigger :as-child="true">
    <Button variant="ghost" size="icon" class="relative w-10 h-10 overflow-hidden transition-all rounded-full ring-2 ring-transparent hover:ring-indigo-500/20">
      
      <!-- صورة المستخدم -->
      <img
        v-if="auth.user.avatar"
        :src="getAvatarUrl(auth.user.avatar)"
        :alt="auth.user.name"
        class="object-cover w-full h-full rounded-full"
      />

      <!-- أول حرف من الاسم إذا لا يوجد صورة -->
      <div
        v-else
        class="flex items-center justify-center w-full h-full text-lg font-bold text-white bg-indigo-600"
      >
        <span>{{ auth.user.name ? auth.user.name.charAt(0).toUpperCase() : '?' }}</span>
      </div>
      
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent align="end" class="w-56 mt-2 rounded-xl border-gray-100 dark:border-neutral-800 bg-white dark:bg-[#111]">
    <UserMenuContent :user="auth.user" />
  </DropdownMenuContent>
</DropdownMenu>


  <!-- زر المستخدم غير مسجّل الدخول -->
<DropdownMenu v-if="!auth?.user">
  <DropdownMenuTrigger :as-child="true">
    <Button
      variant="ghost"
      size="icon"
      class="relative w-10 h-10 transition-all bg-white rounded-full shadow-sm ring-1 ring-transparent hover:ring-indigo-500/30 dark:hover:ring-indigo-400/30 dark:bg-neutral-900"
    >
      <User class="w-5 h-5 text-black dark:text-white" />
    </Button>
  </DropdownMenuTrigger>

<DropdownMenuContent
    align="end"
    class="w-60 mt-2 rounded-xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-[#111] shadow-xl p-2"
  >
    <!-- Login -->
    <DropdownMenuItem>
      <Link href="/login" class="flex items-center w-full gap-3">
        <LogIn class="w-4 h-4 text-black dark:text-white" />
        <span>Login</span>
      </Link>
    </DropdownMenuItem>

    <!-- Create a New Account -->
    <DropdownMenuItem>
      <Link href="/register" class="flex items-center w-full gap-3">
        <UserPlus class="w-4 h-4 text-black dark:text-white" />
        <span>Create a New Account</span>
      </Link>
    </DropdownMenuItem>

    <!-- Back to Home Page -->
    <DropdownMenuItem>
      <Link href="/" class="flex items-center w-full gap-3">
        <Home class="w-4 h-4 text-black dark:text-white" />
        <span>Back to Home Page</span>
      </Link>
    </DropdownMenuItem>

  </DropdownMenuContent>

</DropdownMenu>


</div>

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