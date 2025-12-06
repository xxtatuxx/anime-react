<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { Menu, Home, CalendarClock, Tv, Film, PlayCircle } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AppLogoIcon from '@/components/AppLogoIcon.vue';
import type { NavItem } from '@/types';

defineProps<{
  mainNavItems: NavItem[];
  latestAnime: any;
}>();
</script>

<template>
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
              <span class="font-bold text-gray-900 text-lx dark:text-white">ANIME LAST</span>
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
</template>
