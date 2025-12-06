<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { Search } from 'lucide-vue-next';
import EpisodeOptionsModal from '@/components/EpisodeOptionsModal.vue';

const props = defineProps<{
  visibleMobileEpisodes: any[];
  allEpisodes: any[];
  mobileLimit: number;
  episode: any;
  series: any;
  searchQuery: string;
}>();

const emit = defineEmits(['load-more', 'update:searchQuery']);

const getImageUrl = (path: string | null | undefined) => path ? `/storage/${path}` : '/animes/placeholder.jpg';
const formatDuration = (minutes: number | null | undefined) => {
  if (!minutes) return '??:??';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
};
</script>

<template>
  <div class="block mb-8 lg:hidden">
      
      <!-- Search Box -->
      <div class="relative mb-4">
          <input 
            type="text" 
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            placeholder="بحث في الحلقات..." 
            class="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-[#272727] border-transparent focus:bg-white dark:focus:bg-[#1f1f1f] border focus:border-blue-500 rounded-xl text-sm text-[#0f0f0f] dark:text-white transition-all placeholder-gray-500 outline-none" 
          />
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      </div>

      <div class="flex flex-col gap-4">
          <Link v-for="ep in visibleMobileEpisodes" :key="ep.id" :href="`/ar/episodes/${ep.id}`" class="flex flex-col gap-2 cursor-pointer group p-0 rounded-xl transition-colors">
              <div class="relative w-full aspect-video flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 dark:bg-[#272727]">
                  <img :src="getImageUrl(ep.banner || props.series.cover)" class="object-cover w-full h-full" loading="lazy" />
                  <span class="absolute px-1.5 py-0.5 text-xs font-bold text-white rounded-md bottom-2 right-2 bg-black/80">{{ formatDuration(ep.duration) }}</span>
                  <div v-if="ep.id === props.episode.id" class="absolute inset-0 flex items-center justify-center text-sm font-bold tracking-wider text-white uppercase bg-black/60">جاري التشغيل</div>
              </div>
              <div class="flex flex-col px-1">
                  <h4 class="text-base font-bold text-[#0f0f0f] dark:text-[#f1f1f1] line-clamp-2 leading-snug mb-1">{{ ep.episode_number }} - {{ ep.title || 'عنوان غير متوفر' }}</h4>
                  <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-[#888]">
                      <span>12 ألف مشاهدة</span>
                      <span>•</span>
                      <span>منذ 3 أيام</span>
                  </div>
              </div>
              <div class="absolute top-2 left-2">
                  <EpisodeOptionsModal :episode="ep" />
              </div>
          </Link>
      </div>
      <button 
        v-if="mobileLimit < props.allEpisodes.length" 
        @click="emit('load-more')"
        class="w-full mt-4 py-3 bg-gray-100 dark:bg-[#272727] text-[#0f0f0f] dark:text-[#f1f1f1] font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition"
      >
          عرض المزيد من الحلقات
      </button>
  </div>
</template>
