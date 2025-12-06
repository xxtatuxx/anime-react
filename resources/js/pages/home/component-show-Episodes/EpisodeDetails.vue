<script setup lang="ts">
import { ref, computed } from 'vue';
import { ThumbsUp, ThumbsDown, Share2, Globe, Download, MoreHorizontal, ChevronDown, Check } from 'lucide-vue-next';

const props = defineProps<{
  episode: any;
  series: any;
  allEpisodes: any[];
}>();

const emit = defineEmits(['open-share', 'open-server', 'open-download']);

const isDescriptionExpanded = ref(false);
const isSubscribed = ref(false); // حالة افتراضية للاشتراك للتجربة

// دالة لتنسيق التاريخ بشكل أفضل
const formattedDate = computed(() => {
    if (!props.episode.created_at) return 'منذ يومين';
    return new Date(props.episode.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
});

const getImageUrl = (path: string | null | undefined) => path ? `/storage/${path}` : '/animes/placeholder.jpg';
</script>

<template>
  <div class="w-full max-w-5xl px-4 mx-auto mt-6 font-sans md:px-0" dir="rtl">
      
      <h1 class="mb-4 text-xl font-bold leading-tight text-gray-900 md:text-2xl dark:text-white">
          <span class="ml-2 text-lg text-primary-600 dark:text-primary-400">#{{ props.episode.episode_number }}</span>
          {{ props.episode.title || props.series.name }}
      </h1>

      <div class="flex flex-col justify-between mb-4 md:flex-row md:items-center gap-y-4">
          
          <div class="flex items-center gap-3">
              <div class="relative cursor-pointer group">
                   <div class="w-10 h-10 overflow-hidden transition-all rounded-full md:w-12 md:h-12 ring-2 ring-transparent group-hover:ring-gray-300 dark:group-hover:ring-gray-600">
                        <img :src="getImageUrl(props.series.cover)" class="object-cover w-full h-full" alt="Anime Cover" />
                   </div>
              </div>
              
              <div class="flex flex-col">
                  <h3 class="text-base font-bold text-gray-900 transition cursor-pointer md:text-lg dark:text-gray-100 line-clamp-1 hover:text-gray-600 dark:hover:text-gray-300" :title="props.series.name">
                      {{ props.series.title }}
                  </h3>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ props.allEpisodes.length }} حلقة
                  </span>
              </div>

              <button 
                @click="isSubscribed = !isSubscribed"
                :class="[
                    'mr-4 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2',
                    isSubscribed 
                        ? 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#3a3a3a]' 
                        : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                ]"
              >
                  <span v-if="isSubscribed" class="flex items-center gap-1"><Check class="w-4 h-4" /> مشترك</span>
                  <span v-else>اشتراك</span>
              </button>
          </div>

          <div class="flex items-center gap-2 pb-2 overflow-x-auto md:pb-0 scrollbar-hide">
               <div class="flex items-center bg-gray-100 dark:bg-[#272727] rounded-full overflow-hidden border border-transparent dark:border-[#333]">
                   <button class="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition border-l border-gray-300 dark:border-[#3f3f3f] group">
                       <ThumbsUp class="w-5 h-5 text-gray-700 transition-transform dark:text-gray-200 group-hover:scale-110" />
                       <span class="text-sm font-bold text-gray-700 dark:text-gray-200">1.2K</span>
                   </button>
                   <button class="px-3 py-2 hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition group">
                       <ThumbsDown class="w-5 h-5 text-gray-700 transition-transform dark:text-gray-200 group-hover:scale-110" />
                   </button>
               </div>
               
               <button @click="emit('open-share')" class="action-btn">
                   <Share2 class="w-5 h-5" />
                   <span>مشاركة</span>
               </button>

               <button @click="emit('open-server')" class="action-btn">
                   <Globe class="w-5 h-5" />
                   <span>السيرفر</span>
               </button>

               <button @click="emit('open-download')" class="action-btn">
                   <Download class="w-5 h-5" />
                   <span>تنزيل</span>
               </button>
               
               <button class="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-[#272727] rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition text-gray-700 dark:text-gray-200 flex-shrink-0">
                   <MoreHorizontal class="w-5 h-5" />
               </button>
          </div>
      </div>

      <div 
          class="bg-gray-100/80 dark:bg-[#272727]/60 backdrop-blur-sm rounded-2xl p-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-[#333] transition-colors duration-300 mb-6"
          @click="isDescriptionExpanded = !isDescriptionExpanded"
      >
          <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                  <span>{{ (props.allEpisodes.length * 1500).toLocaleString() }} مشاهدة</span>
                  <span class="text-gray-400">•</span>
                  <span>{{ formattedDate }}</span>
              </div>
              
              <div class="relative">
                  <p 
                    class="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap transition-all duration-300 ease-in-out dark:text-gray-200"
                    :class="!isDescriptionExpanded ? 'line-clamp-2' : ''"
                  >
                      {{ props.series.description || 'قصة هذا الأنمي تدور حول مغامرات مثيرة وشخصيات فريدة تسعى لتحقيق أحلامها في عالم مليء بالتحديات والغموض. (هذا نص تجريبي لعدم توفر الوصف في البيانات).' }}
                  </p>
              </div>

              <button class="self-start mt-1 text-sm font-bold text-gray-600 transition-colors dark:text-gray-400 hover:text-black dark:hover:text-white">
                  {{ isDescriptionExpanded ? 'عرض أقل' : 'المزيد' }}
              </button>
          </div>
      </div>
  </div>
</template>

<style scoped>
/* Utility class for repetitive button styles */
.action-btn {
  @apply flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#272727] rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition flex-shrink-0 text-sm font-bold text-gray-700 dark:text-gray-200 border border-transparent dark:border-[#333];
}

/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}
</style>