<script setup lang="ts">
import AppLayout from '@/layouts/AR-HomeLayout.vue';
import { Episode, Series, EpisodeVideo } from '@/types';
import { Head, Link } from '@inertiajs/vue3';
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { 
  Zap, Search, Smile, ThumbsUp, ThumbsDown, MoreVertical, AlignLeft, Check, 
  ChevronDown, ChevronUp, Play, Monitor, Globe, Filter
} from 'lucide-vue-next';

// Props
const props = defineProps<{
  episode: Episode & { videos: EpisodeVideo[] };
  series: Series;
  videos: EpisodeVideo[];
  allEpisodes: Episode[];
  // ملاحظة: يُفضل تمرير الحلقات العشوائية من السيرفر هنا باسم recommendedEpisodes
}>();

// --- Video Logic ---
const getAutoplayUrl = (url: string) => {
  if (!url) return '';
  const separator = url.includes('?') ? '&' : '?';
  if (url.includes('autoplay=1')) return url;
  return `${url}${separator}autoplay=1`;
};
const currentVideo = ref(props.videos.length ? getAutoplayUrl(props.videos[0].video_url) : '');
const playVideo = (url: string) => { currentVideo.value = getAutoplayUrl(url); };
const isCurrentVideo = (url: string) => currentVideo.value.includes(url);
const getImageUrl = (path: string | null | undefined) => path ? `/storage/${path}` : '/images/placeholder.jpg';
const formatDuration = (minutes: number | null | undefined) => {
  if (!minutes) return '24:00'; // Default duration
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
};

// --- Smart Search Logic ---
const searchQuery = ref('');
const visibleEpisodes = ref<Episode[]>(props.allEpisodes);
const isSearchInvalid = ref(false);

watch(searchQuery, (newValue) => {
  const query = newValue.toLowerCase().trim();
  if (!query) {
    visibleEpisodes.value = props.allEpisodes;
    isSearchInvalid.value = false;
    return;
  }
  const matches = props.allEpisodes.filter(ep => 
    (ep.title || '').toLowerCase().includes(query) || String(ep.episode_number).includes(query)
  );
  if (matches.length > 0) {
    visibleEpisodes.value = matches;
    isSearchInvalid.value = false;
  } else {
    isSearchInvalid.value = true;
  }
});

// --- Random Episodes Logic (Mock Data) ---
// ملاحظة: هذا المنطق يجب أن يأتي من الـ Backend (Laravel)
// Controller Logic Example: Episode::inRandomOrder()->take(8)->with('series')->get();
const randomRecommendations = ref([
    { id: 901, title: 'الحلقة 1', episode_number: 1, banner: null, series: { name: 'One Piece', cover: null } },
    { id: 902, title: 'الحلقة 5', episode_number: 5, banner: null, series: { name: 'Naruto', cover: null } },
    { id: 903, title: 'الحلقة 12', episode_number: 12, banner: null, series: { name: 'Bleach', cover: null } },
    { id: 904, title: 'الحلقة 3', episode_number: 3, banner: null, series: { name: 'Attack on Titan', cover: null } },
    { id: 905, title: 'الحلقة 24', episode_number: 24, banner: null, series: { name: 'Demon Slayer', cover: null } },
    { id: 906, title: 'الحلقة 7', episode_number: 7, banner: null, series: { name: 'Jujutsu Kaisen', cover: null } },
]);

// --- Comments & Replies Logic (بقية الكود الخاص بالتعليقات كما هو) ---
const newComment = ref('');
const replyText = ref('');
const activeReplyId = ref<number | null>(null);
const expandedReplies = ref<Set<number>>(new Set());
const showMainEmojiPicker = ref(false);
const showReplyEmojiPicker = ref(false);
const isMainInputFocused = ref(false); 
const mainEmojiContainer = ref<HTMLElement | null>(null);
const activeReplyContainer = ref<any>(null);
const commonEmojis = ['😀', '😂', '🔥', '❤️', '😭', '👍', '👎', '😡', '😱', '🎉', '🤔', '🥰'];

const toggleMainEmojiPicker = () => showMainEmojiPicker.value = !showMainEmojiPicker.value;
const addMainEmoji = (emoji: string) => newComment.value += emoji;
const openReplyForm = (commentId: number) => { activeReplyId.value = commentId; replyText.value = ''; showReplyEmojiPicker.value = false; };
const cancelReply = () => { activeReplyId.value = null; replyText.value = ''; };
const toggleReplyEmojiPicker = () => showReplyEmojiPicker.value = !showReplyEmojiPicker.value;
const addReplyEmoji = (emoji: string) => replyText.value += emoji;
const toggleExpandedReplies = (commentId: number) => {
  if (expandedReplies.value.has(commentId)) expandedReplies.value.delete(commentId);
  else expandedReplies.value.add(commentId);
};
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (showMainEmojiPicker.value && mainEmojiContainer.value && !mainEmojiContainer.value.contains(target)) showMainEmojiPicker.value = false;
  if (showReplyEmojiPicker.value && activeReplyContainer.value && !activeReplyContainer.value.contains(target)) showReplyEmojiPicker.value = false;
};
onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

const comments = ref([
  { id: 1, user: 'Ahmed Otaku', date: 'منذ ساعتين', content: 'أفضل حلقة في الموسم بلا منازع! 🔥', likes: 245, replies: [] },
  { id: 2, user: 'Sarah Games', date: 'منذ 5 ساعات', content: 'شكراً لكم ❤️', likes: 58, replies: [] },
]);
</script>

<template>
  <Head :title="`${props.series.name} - الحلقة ${props.episode.episode_number}`" />

  <AppLayout class="bg-[#f3f4f6] dark:bg-[#0a0a0a] min-h-screen font-cairo">
    <div class="max-w-[1600px] mx-auto px-4 md:px-6 py-8 direction-rtl" dir="rtl">
      
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        <div class="flex flex-col gap-6 lg:col-span-8">
          
          <div class="relative w-full overflow-hidden bg-black border border-gray-800 shadow-2xl rounded-2xl group">
            <div class="relative z-10 aspect-video">
              <template v-if="currentVideo">
                <iframe
                  :src="currentVideo"
                  class="absolute top-0 left-0 w-full h-full"
                  frameborder="0"
                  allowfullscreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                ></iframe>
              </template>
              <div v-else class="flex flex-col items-center justify-center h-full text-gray-400 bg-[#121212]">
                <Zap class="w-20 h-20 mb-4 opacity-30" />
                <span class="text-xl font-medium">الخادم غير متاح حالياً</span>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-[#151515] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#222]">
            <div class="flex flex-wrap items-start justify-between gap-4 mb-6 border-b border-gray-100 dark:border-[#2a2a2a] pb-6">
              <div>
                <h1 class="mb-2 text-2xl font-bold leading-relaxed text-gray-900 dark:text-white">
                  <span class="ml-2 text-indigo-600 dark:text-indigo-400">#{{ props.episode.episode_number }}</span>
                  {{ props.episode.title || props.series.name }}
                </h1>
                <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span class="flex items-center gap-1"><Monitor class="w-4 h-4"/> {{ props.series.type || 'TV' }}</span>
                  <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span class="flex items-center gap-1"><Globe class="w-4 h-4"/> {{ props.episode.created_at ? new Date(props.episode.created_at).toLocaleDateString('ar-EG') : 'الآن' }}</span>
                </div>
              </div>
              
              <Link :href="`/series/${props.series.id}`" class="flex items-center gap-3 group">
                 <div class="text-left">
                    <div class="text-sm font-bold text-gray-900 transition dark:text-white group-hover:text-indigo-500">{{ props.series.name }}</div>
                    <div class="text-xs text-gray-500">{{ props.series.status ?? 'مستمر' }}</div>
                 </div>
                 <img :src="getImageUrl(props.series.cover)" class="object-cover w-12 h-12 transition duration-300 rounded-lg shadow-sm group-hover:scale-105" />
              </Link>
            </div>

            <div class="flex flex-col gap-3">
               <div class="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                  <Zap class="w-4 h-4 text-yellow-500 fill-current" />
                  <span>سيرفرات المشاهدة:</span>
               </div>
               <div class="flex flex-wrap gap-2">
                  <button
                    v-for="(video, index) in props.videos"
                    :key="video.id"
                    @click="playVideo(video.video_url)"
                    :class="[
                      'relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 border',
                      isCurrentVideo(video.video_url)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20 transform scale-[1.02]'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300 dark:bg-[#1e1e1e] dark:text-gray-300 dark:border-[#333] dark:hover:bg-[#252525]'
                    ]"
                  >
                    <span class="w-2 h-2 rounded-full" :class="isCurrentVideo(video.video_url) ? 'bg-green-400 animate-pulse' : 'bg-gray-400'"></span>
                    <span>السيرفر {{ index + 1 }}</span>
                    <span v-if="video.quality" class="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{{ video.quality }}</span>
                  </button>
               </div>
            </div>
          </div>

          <div class="bg-white dark:bg-[#151515] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#222]">
             <h3 class="flex items-center gap-2 mb-6 text-xl font-bold text-gray-900 dark:text-white">
                <span class="w-1 h-6 bg-indigo-500 rounded-full"></span>
                التعليقات ({{ comments.length }})
             </h3>
             
             <div class="relative mb-8">
                <textarea 
                  v-model="newComment"
                  @focus="isMainInputFocused = true"
                  placeholder="شاركنا رأيك في الحلقة..." 
                  class="w-full bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-xl px-4 py-3 min-h-[50px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white resize-none transition-all shadow-inner text-sm"
                  rows="2"
                ></textarea>
                <div v-if="isMainInputFocused || newComment" class="flex items-center justify-between mt-2 animate-in fade-in slide-in-from-top-2">
                   <div class="relative" ref="mainEmojiContainer">
                      <button @click="toggleMainEmojiPicker" class="p-2 text-gray-500 transition hover:text-indigo-500"><Smile class="w-5 h-5"/></button>
                      <div v-if="showMainEmojiPicker" class="absolute top-10 right-0 z-50 bg-white dark:bg-[#252525] p-2 rounded-xl shadow-xl border dark:border-[#333] grid grid-cols-6 gap-1 w-64">
                         <button v-for="emoji in commonEmojis" :key="emoji" @click="addMainEmoji(emoji)" class="text-xl p-1 hover:bg-gray-100 dark:hover:bg-[#333] rounded">{{ emoji }}</button>
                      </div>
                   </div>
                   <button :disabled="!newComment" class="px-6 py-2 text-sm font-bold text-white transition bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-indigo-600/20">نشر</button>
                </div>
             </div>

             <div class="space-y-6">
                <div v-for="comment in comments" :key="comment.id" class="flex gap-4">
                   <img src="/images/placeholder.jpg" class="object-cover w-10 h-10 bg-gray-200 rounded-full" />
                   <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                         <span class="text-sm font-bold dark:text-white">{{ comment.user }}</span>
                         <span class="text-xs text-gray-500">{{ comment.date }}</span>
                      </div>
                      <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#1e1e1e] p-3 rounded-lg rounded-tr-none">{{ comment.content }}</p>
                      <div class="flex items-center gap-4 mt-2">
                         <button class="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-500"><ThumbsUp class="w-3 h-3"/> {{ comment.likes }}</button>
                         <button class="text-xs text-gray-500 hover:text-indigo-500">رد</button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div class="flex flex-col gap-6 lg:col-span-4">
           
           <div class="bg-white dark:bg-[#151515] rounded-2xl shadow-sm border border-gray-100 dark:border-[#222] overflow-hidden sticky top-4">
              <div class="p-4 border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a]">
                 <div class="flex items-center justify-between mb-3">
                    <h2 class="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                       <Filter class="w-4 h-4"/>
                       حلقات الأنمي
                    </h2>
                    <span class="px-2 py-1 text-xs font-bold text-indigo-700 bg-indigo-100 rounded-md">{{ visibleEpisodes.length }}</span>
                 </div>
                 
                 <div class="relative group">
                    <input 
                      v-model="searchQuery" 
                      type="text" 
                      placeholder="ابحث برقم الحلقة..." 
                      :class="[
                         'w-full pl-4 pr-10 py-2.5 bg-white dark:bg-[#121212] border rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none',
                         isSearchInvalid ? 'border-red-400' : 'border-gray-200 dark:border-[#333]'
                      ]"
                    />
                    <Search class="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                 </div>
              </div>

              <div class="max-h-[600px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                 <Link
                   v-for="ep in visibleEpisodes"
                   :key="ep.id"
                   :href="`/ar/episodes/${ep.id}`"
                   :class="[
                      'flex gap-3 p-2 rounded-xl transition-all duration-200 group',
                      ep.id === props.episode.id 
                        ? 'bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30' 
                        : 'hover:bg-gray-50 dark:hover:bg-[#1e1e1e] border border-transparent'
                   ]"
                 >
                    <div class="relative flex-shrink-0 h-16 overflow-hidden bg-gray-200 rounded-lg w-28">
                       <img :src="getImageUrl(ep.banner || props.series.cover)" class="object-cover w-full h-full transition duration-500 group-hover:scale-110" loading="lazy" />
                       <div v-if="ep.id === props.episode.id" class="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div class="flex items-center justify-center w-3 h-3 bg-white rounded-sm animate-bounce">
                             <div class="w-full h-full bg-indigo-600 rounded-full animate-ping"></div>
                          </div>
                       </div>
                       <span class="absolute bottom-1 left-1 bg-black/80 text-white text-[10px] px-1 rounded">{{ formatDuration(ep.duration) }}</span>
                    </div>

                    <div class="flex flex-col justify-center min-w-0">
                       <h4 :class="['text-sm font-bold line-clamp-1 mb-1', ep.id === props.episode.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-200']">
                          الحلقة {{ ep.episode_number }}
                       </h4>
                       <p class="text-xs text-gray-500 line-clamp-1">{{ ep.title || props.series.name }}</p>
                    </div>
                 </Link>
              </div>
           </div>

        </div>

      </div> <div class="mt-12 pt-8 border-t border-gray-200 dark:border-[#222]">
         <div class="flex items-center gap-3 mb-6">
            <div class="flex items-center justify-center w-10 h-10 text-purple-600 bg-purple-100 rounded-full dark:bg-purple-900/20">
               <Zap class="w-5 h-5" />
            </div>
            <div>
               <h2 class="text-2xl font-bold text-gray-900 dark:text-white">قد يعجبك أيضاً</h2>
               <p class="text-sm text-gray-500">حلقات مختارة عشوائياً من أنميات مختلفة</p>
            </div>
         </div>

         <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Link
               v-for="rec in randomRecommendations"
               :key="rec.id"
               href="#" 
               class="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 dark:bg-[#1a1a1a] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
               <img src="/images/placeholder.jpg" class="object-cover w-full h-full transition opacity-90 group-hover:opacity-100" />
               <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
               
               <div class="absolute bottom-0 left-0 right-0 p-3">
                  <span class="inline-block px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded mb-1">
                     {{ rec.series.name }}
                  </span>
                  <h3 class="text-sm font-bold text-white line-clamp-1">{{ rec.title }}</h3>
                  <div class="flex items-center gap-1 text-[10px] text-gray-300 mt-1">
                     <Play class="w-3 h-3 fill-current" />
                     <span>EP {{ rec.episode_number }}</span>
                  </div>
               </div>

               <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/20 backdrop-blur-[1px]">
                  <div class="flex items-center justify-center w-10 h-10 text-black transition transform scale-50 bg-white rounded-full shadow-lg group-hover:scale-100">
                     <Play class="w-5 h-5 fill-current ml-0.5" />
                  </div>
               </div>
            </Link>
         </div>
      </div>

    </div>
  </AppLayout>
</template>

<style scoped>
/* Scrollbar Styling */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }

/* Animations */
.animate-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>