<script setup lang="ts">
import AppLogo from '@/components/AppLogo.vue';
import AppLogoIcon from '@/components/AppLogoIcon.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import UserMenuContent from '@/components/UserMenuContent.vue';
import { getInitials } from '@/composables/useInitials';
import type { BreadcrumbItem, NavItem } from '@/types';
import { Link, usePage, router as inertia } from '@inertiajs/vue3';
import { BookOpen, Folder, Menu } from 'lucide-vue-next';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Input } from '@/components/ui/input';
import axios from 'axios';

interface Props {
  breadcrumbs?: BreadcrumbItem[];
}

const props = withDefaults(defineProps<Props>(), { breadcrumbs: () => [] });
const page = usePage();
const auth = computed(() => page.props.auth);

// آخر أنمي TV وآخر Movie وآخر حلقة يتم جلبها من Route
const latestAnime = ref<{ latest_tv?: any; latest_movie?: any; latest_episode?: any }>({});

// جلب البيانات عند تحميل الصفحة
onMounted(async () => {
  try {
    const res = await axios.get('/latest-tv-anime');
    latestAnime.value = res.data;
  } catch (e) {
    console.error('Failed to fetch latest anime', e);
    latestAnime.value = {};
  }
});

// روابط رئيسية
const mainNavItems: NavItem[] = [
  { title: 'الرئيسية', href: '/ar/home' },
  { title: 'قائمة مسلسلات - TV', href: '/ar/anime' },
  { title: 'قائمة الأفلام - Movies', href: '/ar/movies' },
  { title: 'قائمة الحلقات - Episodes', href: '/ar/episodes-list' },
  { title: 'أنمي القادم', href: '/ar/' },
];

// روابط يمين
const rightNavItems: NavItem[] = [
  { title: 'Repository', href: 'https://github.com/laravel/vue-starter-kit', icon: Folder },
  { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits', icon: BookOpen },
];

// Search
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

const goToAnime = (id: number) => inertia.visit(route('animes.show', id));
const goToEpisode = (id: number) => inertia.visit(route('episodes.show', id));

const searchWrapper = ref<HTMLElement | null>(null);
const handleClickOutside = (event: MouseEvent) => {
  if (searchWrapper.value && !searchWrapper.value.contains(event.target as Node)) {
    dropdownOpen.value = false;
  }
};
onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>
<template>
<div>
  <!-- Top Bar -->
  <div class="fixed top-0 left-0 z-50 w-full bg-white border-b border-sidebar-border/80 dark:bg-black">
    <div class="relative flex items-center h-24 px-4 mx-auto md:max-w-7xl">

      <!-- Mobile Menu -->
      <div class="lg:hidden">
        <Sheet>
          <SheetTrigger :as-child="true">
            <Button variant="ghost" size="icon" class="mr-2 h-9 w-9"><Menu class="w-5 h-5" /></Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-[300px] p-6">
            <SheetTitle class="sr-only">Navigation Menu</SheetTitle>
            <SheetHeader class="flex justify-start text-left">
              <AppLogoIcon class="text-black fill-current size-6 dark:text-white" />
            </SheetHeader>
            <div class="flex flex-col justify-between flex-1 h-full py-6 space-y-4">
              <nav class="-mx-3 space-y-1">
                <Link v-for="item in mainNavItems" :key="item.title" :href="item.href"
                      class="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg gap-x-2 hover:bg-accent">

                  <!-- أيقونة + عنوان الرابط -->
                  <div class="flex items-center gap-2">
                    <component v-if="item.icon" :is="item.icon" class="w-5 h-5"/>
                    {{ item.title }}
                  </div>

                  <!-- آخر TV Anime -->
                  <template v-if="item.title.includes('TV') && latestAnime.latest_tv">
                    <div class="flex items-center justify-end gap-2 mr-2">
                      <span class="text-xs font-semibold text-right">{{ latestAnime.latest_tv.title }}</span>
                      <img v-if="latestAnime.latest_tv.image"
                           :src="latestAnime.latest_tv.image.includes('http') ? latestAnime.latest_tv.image : `/storage/${latestAnime.latest_tv.image}`"
                           alt="latest tv anime" class="object-cover w-8 h-8 rounded-md"/>
                    </div>
                  </template>

                  <!-- آخر Movie -->
                  <template v-if="item.title.includes('Movies') && latestAnime.latest_movie">
                    <div class="flex items-center justify-end gap-2 mr-2">
                      <span class="text-xs font-semibold text-right">{{ latestAnime.latest_movie.title }}</span>
                      <img v-if="latestAnime.latest_movie.image"
                           :src="latestAnime.latest_movie.image.includes('http') ? latestAnime.latest_movie.image : `/storage/${latestAnime.latest_movie.image}`"
                           alt="latest movie" class="object-cover w-8 h-8 rounded-md"/>
                    </div>
                  </template>

                  <!-- آخر حلقة -->
                  <template v-if="item.title.includes('Episodes') && latestAnime.latest_episode">
                    <div class="flex items-center justify-end gap-2 mr-2">
                      <span class="text-xs font-semibold text-right">
                        {{ latestAnime.latest_episode.title }} - حلقة {{ latestAnime.latest_episode.episode_number }}
                      </span>
                      <img v-if="latestAnime.latest_episode.thumbnail"
                           :src="latestAnime.latest_episode.thumbnail.includes('http') ? latestAnime.latest_episode.thumbnail : `/storage/${latestAnime.latest_episode.thumbnail}`"
                           alt="latest episode" class="object-cover w-8 h-8 rounded-md"/>
                    </div>
                  </template>

                </Link>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <!-- Logo -->
      <Link :href="route('dashboard')" class="flex items-center gap-x-2"><AppLogo /></Link>

      <!-- Desktop Menu -->
      <div class="items-center hidden h-full gap-4 lg:flex lg:flex-1">
        <div class="relative flex items-center gap-4 ml-0 group">
          <!-- كلمة "القائمة" مع السهم -->
          <button class="flex items-center gap-1 px-5 text-sm font-medium cursor-pointer hover:text-black dark:hover:text-white">
            <span>القائمة</span>
            <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
            </svg>
          </button>

          <!-- الشريط المنسدل -->
          <div class="absolute left-0 w-[800px] z-50 invisible transition-all duration-200 bg-white border rounded-lg shadow-xl opacity-0 top-full dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 group-hover:opacity-100 group-hover:visible w-72">
            <div class="max-h-[350px] overflow-y-auto py-2">
              <div v-for="item in mainNavItems" :key="item.title" class="flex flex-col">
                <Link :href="item.href" class="flex items-center justify-between px-5 py-4 text-[15px] font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
                  
                  <!-- أيقونة + عنوان الرابط -->
                  <div class="flex items-center gap-2">
                    <component v-if="item.icon" :is="item.icon" class="w-5 h-5 ml-2 opacity-80"/>
                    <span>{{ item.title }}</span>
                  </div>

                  <!-- آخر TV Anime -->
                  <template v-if="item.title.includes('TV') && latestAnime.latest_tv">
                    <div class="flex items-center justify-end gap-2 mr-4">
                      <span class="text-xs font-semibold text-right">{{ latestAnime.latest_tv.title }}</span>
                      <img v-if="latestAnime.latest_tv.image"
                           :src="latestAnime.latest_tv.image.includes('http') ? latestAnime.latest_tv.image : `/storage/${latestAnime.latest_tv.image}`"
                           alt="latest tv anime" class="object-cover w-16 h-16 rounded-md"/>
                    </div>
                  </template>

                  <!-- آخر Movie -->
                  <template v-if="item.title.includes('Movies') && latestAnime.latest_movie">
                    <div class="flex items-center justify-end gap-2 mr-4">
                      <span class="text-xs font-semibold text-right">{{ latestAnime.latest_movie.title }}</span>
                      <img v-if="latestAnime.latest_movie.image"
                           :src="latestAnime.latest_movie.image.includes('http') ? latestAnime.latest_movie.image : `/storage/${latestAnime.latest_movie.image}`"
                           alt="latest movie" class="object-cover w-16 h-16 rounded-md"/>
                    </div>
                  </template>

                  <!-- آخر حلقة -->
                  <template v-if="item.title.includes('Episodes') && latestAnime.latest_episode">
                    <div class="flex items-center justify-end gap-2 mr-4">
                      <span class="text-xs font-semibold text-right">
                        {{ latestAnime.latest_episode.title }} - حلقة {{ latestAnime.latest_episode.episode_number }}
                      </span>
                      <img v-if="latestAnime.latest_episode.thumbnail"
                           :src="latestAnime.latest_episode.thumbnail.includes('http') ? latestAnime.latest_episode.thumbnail : `/storage/${latestAnime.latest_episode.thumbnail}`"
                           alt="latest episode" class="object-cover w-16 h-16 rounded-md"/>
                    </div>
                  </template>

                </Link>
                <div class="w-full h-[1px] bg-neutral-200 dark:bg-neutral-700"></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- باقي العناصر: Search, Right Nav, User Menu كما هي -->
      <!-- ... الكود يبقى كما هو ... -->

    </div>
  </div>

  <div class="pt-24"></div>

  <div v-if="props.breadcrumbs.length > 1" class="flex w-full border-b border-sidebar-border/70">
    <div class="flex items-center justify-start w-full h-12 px-4 mx-auto text-neutral-500 md:max-w-7xl">
      <Breadcrumbs :breadcrumbs="breadcrumbs" />
    </div>
  </div>
</div>
</template>
