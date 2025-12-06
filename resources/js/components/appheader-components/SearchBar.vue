<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { router as inertia, Link } from '@inertiajs/vue3';
import { Search, X, Loader2 } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
}>();

const searchQuery = ref('');
const dropdownOpen = ref(false);
const searchResults = ref<{ animes: any[]; episodes: any[] }>({ animes: [], episodes: [] });
const searching = ref(false);
const searchWrapper = ref<HTMLElement | null>(null);

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

const goToAnime = (id: number) => inertia.visit(route('ar.animes.show', id));
const goToEpisode = (id: number) => inertia.visit(route('ar.episodes.show', id));

const handleClickOutside = (event: MouseEvent) => {
  if (searchWrapper.value && !searchWrapper.value.contains(event.target as Node)) {
    dropdownOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
  <div class="flex items-center">
      <!-- Mobile Search Button (Visible only when search is closed) -->
      <Button v-if="!isOpen" variant="ghost" size="icon" class="w-12 h-12 text-gray-700 rounded-full md:hidden dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800" @click="emit('update:isOpen', true)">
          <Search class="w-8 h-8" />
      </Button>

      <!-- Search Overlay (Visible when search is open) -->
      <div ref="searchWrapper" :class="['transition-all duration-300', isOpen ? 'fixed inset-0 z-[60] flex items-start pt-4 justify-center bg-white/95 backdrop-blur-md dark:bg-black/95 px-4' : 'relative hidden md:block w-64 lg:w-72 xl:w-80']">
        
        <div class="relative flex items-center w-full max-w-2xl gap-2 mx-auto mt-2 md:max-w-none md:mx-0 md:mt-0">
           <div class="relative flex-1">
              <Search class="absolute w-5 h-5 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
              <Input v-model="searchQuery" placeholder="بحث..." class="w-full h-12 pl-4 pr-12 text-base transition-all border-gray-200 rounded-full bg-gray-50 dark:bg-neutral-900 dark:border-neutral-800 focus:ring-2 focus:ring-indigo-500 md:h-10 md:text-sm md:pr-10" @focus="dropdownOpen = true"/>
           </div>
           <!-- Close Button for Mobile Search (Next to Input) -->
           <Button v-if="isOpen" variant="ghost" size="icon" class="w-10 h-10 bg-gray-100 rounded-full md:hidden shrink-0 dark:bg-neutral-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500" @click="emit('update:isOpen', false)">
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
  </div>
</template>
