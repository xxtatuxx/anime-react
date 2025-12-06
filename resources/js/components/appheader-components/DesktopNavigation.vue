<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { Home, Sparkles, ChevronDown } from 'lucide-vue-next';
import type { NavItem } from '@/types';

defineProps<{
  mainNavItems: NavItem[];
  latestAnime: any;
}>();
</script>

<template>
  <div class="items-center hidden h-full gap-2 ml-6 lg:flex lg:flex-1">
    
    <Link href="/ar/home" 
          class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 transition-all duration-200 rounded-full dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
       <Home class="w-4 h-4" />
       <span>الرئيسية</span>
    </Link>

    <Link href="/ar/coming-soon" 
          class="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white transition-all duration-300 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105">
       <Sparkles class="w-4 h-4 animate-pulse" />
       <span>Coming Soon</span>
    </Link>

    <div class="relative flex items-center ml-2 group">
      <button class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
        <span>القائمة</span>
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
</template>
