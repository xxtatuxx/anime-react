<script setup lang="ts">
import { Globe, X, Check } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  videos: any[];
  currentVideo: string;
}>();

const emit = defineEmits(['close', 'change-server']);
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity" @click.self="emit('close')" >
      <div class="bg-white dark:bg-[#1f1f1f] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 p-0 relative m-4">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#333]">
              <h3 class="flex items-center gap-2 text-lg font-bold text-black dark:text-white">
                 <Globe class="w-5 h-5 text-purple-500" />
                 تغيير السيرفر
              </h3>
              <button @click="emit('close')" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] transition"><X class="w-5 h-5 text-gray-500 dark:text-gray-300" /></button>
          </div>
          <div class="p-5">
              <div class="space-y-3">
                  <button 
                    v-for="(video, idx) in videos" 
                    :key="idx" 
                    @click="emit('change-server', video.video_url)"
                    class="flex items-center justify-between w-full p-4 border border-gray-200 dark:border-[#333] rounded-xl hover:bg-purple-50 dark:hover:bg-[#2a2a2a] transition group"
                  >
                      <div class="flex items-center gap-3">
                          <div class="flex items-center justify-center w-10 h-10 text-purple-600 bg-purple-100 rounded-full dark:bg-purple-900/20 dark:text-purple-400">
                              <Globe class="w-5 h-5" />
                          </div>
                          <div class="flex flex-col items-start">
                              <span class="text-sm font-bold text-gray-900 dark:text-white">{{ video.server_name || `سيرفر ${idx + 1}` }}</span>
                              <span class="text-xs text-gray-500 dark:text-gray-400">جودة عالية FHD</span>
                          </div>
                      </div>
                      <div v-if="currentVideo.includes(video.video_url)" class="flex items-center justify-center w-6 h-6 text-white bg-green-500 rounded-full">
                          <Check class="w-4 h-4" />
                      </div>
                  </button>
                  <div v-if="videos.length === 0" class="py-4 text-center text-gray-500">
                      لا توجد سيرفرات إضافية متاحة حالياً.
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>
