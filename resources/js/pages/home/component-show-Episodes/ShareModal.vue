<script setup lang="ts">
import { Share2, X, MessageCircle, Send, Twitter, Instagram, Link as LinkIcon } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(['close']);

const shareOptions = [
    { name: 'واتس أب', icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
    { name: 'تيليجرام', icon: Send, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    { name: 'تويتر (X)', icon: Twitter, color: 'text-black dark:text-white', bg: 'bg-gray-100 dark:bg-gray-700/30' },
    { name: 'إنستجرام', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/20' },
    { name: 'فيسبوك', icon: Share2, color: 'text-blue-700', bg: 'bg-blue-100 dark:bg-blue-800/20' },
];

const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('تم نسخ الرابط بنجاح');
    emit('close');
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity" @click.self="emit('close')" >
      <div class="bg-white dark:bg-[#1f1f1f] w-full max-w-sm md:max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 p-0 relative m-4">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#333]">
              <h3 class="flex items-center gap-2 text-lg font-bold text-black dark:text-white">
                 <Share2 class="w-5 h-5 text-blue-500" />
                 مشاركة الحلقة
              </h3>
              <button @click="emit('close')" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] transition"><X class="w-5 h-5 text-gray-500 dark:text-gray-300" /></button>
          </div>
          <div class="p-6">
              <div class="grid grid-cols-3 gap-4 mb-6">
                 <button v-for="opt in shareOptions" :key="opt.name" class="flex flex-col items-center gap-2 group">
                    <div :class="['w-14 h-14 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-110 shadow-sm', opt.bg]">
                        <component :is="opt.icon" :class="['w-7 h-7', opt.color]" />
                    </div>
                    <span class="text-xs font-medium text-gray-600 dark:text-gray-300">{{ opt.name }}</span>
                 </button>
              </div>
              
              <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl">
                 <LinkIcon class="w-4 h-4 mr-2 text-gray-400" />
                 <input type="text" :value="'https://animewebsite.com/ep/1'" readonly class="flex-1 text-xs text-gray-500 bg-transparent outline-none" />
                 <button @click="copyLink" class="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:opacity-80 transition">نسخ</button>
              </div>
          </div>
      </div>
  </div>
</template>
