<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, Download, HardDrive } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  episode: any;
  series: any;
  downloadLinks: any[];
}>();

const emit = defineEmits(['close']);

const isDownloadLoading = ref(false);

watch(() => props.show, (val) => {
    if (val) {
        isDownloadLoading.value = true;
        setTimeout(() => {
            isDownloadLoading.value = false;
        }, 1500);
    }
});

const getImageUrl = (path: string | null | undefined) => path ? `/storage/${path}` : '/animes/placeholder.jpg';
const formatDuration = (minutes: number | null | undefined) => {
  if (!minutes) return '??:??';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity" @click.self="emit('close')" >
      <div class="bg-white dark:bg-[#1f1f1f] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 p-0 relative m-4">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#333]">
              <h3 class="text-lg font-bold text-black dark:text-white">تحميل الحلقة</h3>
              <button @click="emit('close')" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] transition"><X class="w-5 h-5 text-gray-500 dark:text-gray-300" /></button>
          </div>
          <div class="p-5">
              <div v-if="isDownloadLoading" class="space-y-4 animate-pulse">
                  <div class="w-full h-40 bg-gray-200 dark:bg-[#333] rounded-xl"></div>
                  <div class="space-y-2"><div class="h-4 bg-gray-200 dark:bg-[#333] rounded w-3/4"></div><div class="h-3 bg-gray-200 dark:bg-[#333] rounded w-1/2"></div></div>
              </div>
              <div v-else class="duration-300 animate-in fade-in zoom-in">
                    <div class="flex gap-4 mb-6">
                        <div class="w-32 h-20 flex-shrink-0 bg-gray-200 dark:bg-[#272727] rounded-lg overflow-hidden relative shadow-md">
                             <img :src="getImageUrl(props.episode.banner || props.series.cover)" class="object-cover w-full h-full" />
                             <span class="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">{{ formatDuration(props.episode.duration) }}</span>
                        </div>
                        <div class="flex flex-col justify-center">
                            <h4 class="text-sm font-bold leading-tight text-black dark:text-white line-clamp-2">{{ props.episode.episode_number }} - {{ props.episode.title || props.series.name }}</h4>
                            <span class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ props.series.name }}</span>
                            <span class="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded mt-2 self-start font-medium">FHD 1080p</span>
                        </div>
                    </div>
                    <div class="space-y-2.5">
                        <p class="mb-2 text-xs font-bold text-gray-500 dark:text-gray-400">سيرفرات التحميل المتاحة:</p>
                        <a v-for="(link, idx) in downloadLinks" :key="idx" :href="link.url" class="flex items-center justify-between p-3 border border-gray-200 dark:border-[#333] rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition group cursor-pointer">
                            <div class="flex items-center gap-3">
                                <component :is="link.icon" :class="['w-5 h-5', link.color]" />
                                <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ link.name }}</span>
                            </div>
                            <Download class="w-4 h-4 text-gray-400 transition group-hover:text-black dark:group-hover:text-white" />
                        </a>
                    </div>
              </div>
          </div>
      </div>
  </div>
</template>
