<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Link } from '@inertiajs/vue3';
import { Search, MoreVertical, Loader2 } from 'lucide-vue-next';
import EpisodeOptionsModal from '@/components/EpisodeOptionsModal.vue';

const props = defineProps<{
  initialEpisodes: any[];
  episode: any;
  series: any;
}>();

const episodes = ref<any[]>([...props.initialEpisodes]);
const page = ref(1);
const loading = ref(false);
const hasMore = ref(true);

watch(() => props.initialEpisodes, (newVal) => {
    episodes.value = [...newVal];
    page.value = 1;
    hasMore.value = true;
});

const getImageUrl = (path: string | null | undefined) => path ? `/storage/${path}` : '/animes/placeholder.jpg';
const formatDuration = (minutes: number | null | undefined) => {
  if (!minutes) return '??:??';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
};

const loadMore = async () => {
    if (loading.value || !hasMore.value) return;
    
    loading.value = true;
    try {
        const response = await fetch(`/ar/episodes/latest-paginated?page=${page.value + 1}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            episodes.value.push(...data.data);
            page.value++;
            hasMore.value = data.next_page_url !== null;
        } else {
            hasMore.value = false;
        }
    } catch (error) {
        console.error('Failed to load more episodes', error);
    } finally {
        loading.value = false;
    }
};

const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadMore();
        }
    }, { root: null, rootMargin: '100px' });

    if (sentinel.value) {
        observer.observe(sentinel.value);
    }
});

onUnmounted(() => {
    if (observer) {
        observer.disconnect();
    }
});

</script>

<template>
  <div class="flex flex-col bg-white dark:bg-[#1f1f1f] rounded-xl overflow-hidden border border-gray-100 dark:border-[#333]">
      <div class="flex flex-col">
          <div class="p-3 border-b border-gray-100 dark:border-[#333]">
              <h3 class="text-sm font-bold text-gray-800 dark:text-white">آخر الحلقات المضافة</h3>
          </div>
          <div 
              class="flex flex-col flex-1 w-full gap-2 p-2"
          >
              <Link v-for="ep in episodes" :key="ep.id" :href="`/ar/episodes/${ep.id}`" class="flex gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                <div class="relative w-[170px] h-[100px] flex-shrink-0 rounded-md overflow-hidden bg-gray-200 dark:bg-[#272727]">
                    <img :src="getImageUrl(ep.banner || ep.series?.cover || props.series.cover)" class="object-cover w-full h-full" loading="lazy" />
                    <span class="absolute px-1 text-[12px] font-bold text-white rounded-sm bottom-1 right-1 bg-black/80">{{ formatDuration(ep.duration) }}</span>
                    <div v-if="ep.id === props.episode.id" class="absolute inset-0 flex items-center justify-center text-[12px] font-bold tracking-wider text-white uppercase bg-black/60">جاري التشغيل</div>
                </div>
                <div class="flex flex-col flex-1 min-w-0 justify-center">
                    <h4 class="text-[13px] font-bold text-[#0f0f0f] dark:text-[#f1f1f1] line-clamp-2 leading-tight mb-1" :title="ep.title">{{ ep.episode_number }} - {{ ep.title || 'عنوان غير متوفر' }}</h4>
                    <div class="text-[13px] text-gray-700 dark:text-[#aaaaaa] font-medium mb-0.5">
                        {{ ep.series?.description || props.series.description }}
                    </div>
                    
                     <div class="flex items-center gap-2 text-[12px] text-gray-700 dark:text-[#888]">
                       <span>12 ألف مشاهدة</span>
                       <span>•</span>
                       <span>منذ 3 أيام</span>
                    </div>
                </div>
                <div class="flex items-center self-center pl-1">
                    <EpisodeOptionsModal :episode="ep" />
                </div>
              </Link>
              
              <div v-if="loading" class="flex justify-center p-2">
                  <Loader2 class="w-6 h-6 animate-spin text-gray-500" />
              </div>
              <div ref="sentinel" class="h-2 w-full"></div>
          </div>
      </div>
  </div>
</template>
