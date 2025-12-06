<script setup lang="ts">
import { Subtitles, X, UploadCloud, FileText } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  availableSubtitles: any[];
}>();

const emit = defineEmits(['close']);

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        alert(`تم اختيار الملف: ${target.files[0].name}`);
        emit('close');
    }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity" @click.self="emit('close')" >
      <div class="bg-white dark:bg-[#1f1f1f] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 p-0 relative m-4">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#333]">
              <h3 class="flex items-center gap-2 text-lg font-bold text-black dark:text-white">
                 <Subtitles class="w-5 h-5 text-yellow-500" />
                 ملف الترجمة
              </h3>
              <button @click="emit('close')" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] transition"><X class="w-5 h-5 text-gray-500 dark:text-gray-300" /></button>
          </div>
          <div class="p-5">
              <div class="space-y-4">
                 <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-[#444] rounded-xl cursor-pointer bg-gray-50 dark:bg-[#252525] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud class="w-8 h-8 mb-2 text-gray-400" />
                        <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">اضغط لاختيار ملف الترجمة</p>
                        <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">SRT, VTT (Max 2MB)</p>
                    </div>
                    <input type="file" class="hidden" accept=".srt,.vtt" @change="handleFileUpload" />
                 </label>

                 <div class="relative flex items-center justify-center">
                    <div class="absolute inset-0 flex items-center"><span class="w-full border-t border-gray-200 dark:border-[#333]"></span></div>
                    <span class="relative px-3 text-xs text-gray-500 bg-white dark:bg-[#1f1f1f]">أو اختر من القائمة</span>
                 </div>

                 <div class="space-y-2">
                    <div v-for="(sub, idx) in availableSubtitles" :key="idx" class="flex items-center justify-between p-3 border border-gray-100 dark:border-[#333] rounded-lg hover:bg-purple-50 dark:hover:bg-[#2a2a2a] cursor-pointer group transition">
                        <div class="flex items-center gap-3">
                            <FileText class="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                            <span class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ sub.lang }}</span>
                        </div>
                        <span class="text-[10px] bg-gray-100 dark:bg-[#333] text-gray-500 px-2 py-0.5 rounded">{{ sub.type }}</span>
                    </div>
                 </div>
              </div>
          </div>
      </div>
  </div>
</template>
