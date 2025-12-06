<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Head, Link, usePage } from '@inertiajs/vue3';
import AppLayout from '@/layouts/EN-HomeLayout.vue';
import {
  Zap, Search, Smile, ThumbsUp, ThumbsDown, MoreVertical, AlignLeft, Check, ChevronDown, ChevronUp,
  Share2, Download, X, Copy, HardDrive, Subtitles, Eye, Clock, MessageSquare, HelpCircle, FileText, UploadCloud,
  Twitter, Instagram, Send, Link as LinkIcon, MessageCircle, Bell, Globe
} from 'lucide-vue-next';

function truncate(text: string, max: number) {
    if (!text) return "";
    return text.length > max ? text.substring(0, max) + "..." : text;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
}

// --- Props ---
const props = defineProps<{
  episode: Episode & { videos: EpisodeVideo[] };
  series: Series & { description?: string };
  videos: EpisodeVideo[];
  allEpisodes: Episode[];
}>();

// --- Auth User & Avatar Logic ---
const page = usePage();
const authUser = computed<User | null>(() => page.props.auth?.user || null);

const getAvatarUrl = (avatar: string) => {
  if (!avatar) return '';
  if (avatar.startsWith('avatars/')) return `/storage/${avatar}`;
  return `/storage/avatars/${avatar}`;
};

// --- Video Logic ---
const getAutoplayUrl = (url: string) => {
  if (!url) return '';
  const separator = url.includes('?') ? '&' : '?';
  let newUrl = url;
  if (!newUrl.includes('autoplay=1')) newUrl += `${separator}autoplay=1`;
  if (!newUrl.includes('mute=0')) newUrl += `&mute=0`; 
  return newUrl;
};

const currentVideo = ref(props.videos.length ? getAutoplayUrl(props.videos[0].video_url) : '');
const getImageUrl = (path: string | null | undefined) => path ? `/storage/${path}` : '/animes/placeholder.jpg';
const formatDuration = (minutes: number | null | undefined) => {
  if (!minutes) return '??:??';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
};

// --- Subtitle Logic ---
const showSubtitleModal = ref(false);
const openSubtitleModal = () => showSubtitleModal.value = true;
const closeSubtitleModal = () => showSubtitleModal.value = false;

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        alert(`تم اختيار الملف: ${target.files[0].name}`);
        closeSubtitleModal();
    }
};

// --- Share Modal Logic ---
const showShareModal = ref(false);
const openShareModal = () => showShareModal.value = true;
const closeShareModal = () => showShareModal.value = false;

const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('تم نسخ الرابط بنجاح');
    closeShareModal();
};

const shareOptions = [
    { name: 'واتس أب', icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
    { name: 'تيليجرام', icon: Send, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    { name: 'تويتر (X)', icon: Twitter, color: 'text-black dark:text-white', bg: 'bg-gray-100 dark:bg-gray-700/30' },
    { name: 'إنستجرام', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/20' },
    { name: 'فيسبوك', icon: Share2, color: 'text-blue-700', bg: 'bg-blue-100 dark:bg-blue-800/20' },
];

// --- Smart Search Logic ---
const searchQuery = ref('');
const isSearchInvalid = ref(false);

watch(searchQuery, (newValue) => {
  const query = newValue.toLowerCase().trim();
  if (!query) {
    isSearchInvalid.value = false;
    return;
  }
  const matches = props.allEpisodes.filter(ep => 
    (ep.title || '').toLowerCase().includes(query) || String(ep.episode_number).includes(query)
  );
  if (matches.length > 0) {
    isSearchInvalid.value = false;
  } else {
    isSearchInvalid.value = true;
  }
});

// --- Download Modal Logic ---
const showDownloadModal = ref(false);
const isDownloadLoading = ref(false);

const openDownloadModal = () => {
    showDownloadModal.value = true;
    isDownloadLoading.value = true;
    setTimeout(() => {
        isDownloadLoading.value = false;
    }, 1500);
};

const closeDownloadModal = () => {
    showDownloadModal.value = false;
};

// --- Server Modal Logic ---
const showServerModal = ref(false);
const openServerModal = () => showServerModal.value = true;
const closeServerModal = () => showServerModal.value = false;

const changeServer = (url: string) => {
    currentVideo.value = getAutoplayUrl(url);
    closeServerModal();
};

// --- Episodes List Logic ---
const mobileLimit = ref(10);
const desktopLimit = ref(20);

const visibleMobileEpisodes = computed(() => {
    return props.allEpisodes.slice(0, mobileLimit.value);
});

const visibleDesktopEpisodes = computed(() => {
    if (searchQuery.value) {
         const query = searchQuery.value.toLowerCase().trim();
         return props.allEpisodes.filter(ep => 
            (ep.title || '').toLowerCase().includes(query) || String(ep.episode_number).includes(query)
         );
    }
    return props.allEpisodes.slice(0, desktopLimit.value);
});

const loadMoreMobile = () => { mobileLimit.value += 10; };

const handleDesktopScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 100) {
        desktopLimit.value += 20;
    }
};

// --- Comments & Emoji Logic ---
const newComment = ref('');
const replyText = ref('');
const activeReplyId = ref<number | null>(null);
const expandedReplies = ref<Set<number>>(new Set());
const showMainEmojiPicker = ref(false);
const showReplyEmojiPicker = ref(false);
const isMainInputFocused = ref(false);
const isDescriptionExpanded = ref(false);

const mainEmojiContainer = ref<HTMLElement | null>(null);
const activeReplyContainer = ref<HTMLElement | null>(null);

const emojis = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾'];

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

// --- Event Listeners ---
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (showMainEmojiPicker.value && mainEmojiContainer.value && !mainEmojiContainer.value.contains(target)) {
    showMainEmojiPicker.value = false;
  }
  if (showReplyEmojiPicker.value && activeReplyContainer.value && !activeReplyContainer.value.contains(target)) {
    showReplyEmojiPicker.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

// --- Dummy Data ---
const comments = ref([
  {
    id: 1, user: 'Ahmed Otaku', date: 'منذ ساعتين', content: 'أفضل حلقة في الموسم بلا منازع! التحريك كان خرافياً والقصة بدأت تأخذ منحنى حماسي جداً.', likes: 245,
    replies: [
        { id: 101, user: 'Sami San', date: 'منذ ساعة', content: 'أتفق معك تماماً، خاصة المشهد الأخير!' }
    ]
  },
  {
    id: 2, user: 'Naruto Fan', date: 'منذ 5 ساعات', content: 'هل لاحظ أحدكم التلميح في الدقيقة 12:30؟ أعتقد أنه يشير إلى المانجا.', likes: 120,
    replies: []
  }
]);

// Download Links Data
const downloadLinks = [
    { name: 'Mediafire', url: '#', icon: HardDrive, color: 'text-blue-500' },
    { name: 'Mega', url: '#', icon: HardDrive, color: 'text-red-500' },
    { name: 'Google Drive', url: '#', icon: HardDrive, color: 'text-green-500' },
    { name: '4Shared', url: '#', icon: HardDrive, color: 'text-blue-400' },
];

const availableSubtitles = [
    { lang: 'العربية (Arabic)', type: 'Official' },
    { lang: 'English', type: 'Official' },
    { lang: 'Español', type: 'Fan Sub' },
];
</script>


<template>
  <Head :title="props.episode.title ?? 'تفاصيل الحلقة'" >
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" />
  </Head> 

  <!-- Download Modal -->
 <div v-if="showDownloadModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity" @click.self="closeDownloadModal">
  <div class="bg-white dark:bg-[#1f1f1f] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 p-0 relative m-4">
      
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#333]">
          <h3 class="text-lg font-bold text-black dark:text-white">Download Episode</h3>
          <button @click="closeDownloadModal" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] transition">
              <X class="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
      </div>
      
      <div class="p-5">
          <div v-if="isDownloadLoading" class="space-y-4 animate-pulse">
              <div class="w-full h-40 bg-gray-200 dark:bg-[#333] rounded-xl"></div>
              <div class="space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-[#333] rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 dark:bg-[#333] rounded w-1/2"></div>
              </div>
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
                  <p class="mb-2 text-xs font-bold text-gray-500 dark:text-gray-400">Available Download Servers:</p>
                  
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


  <!-- Share Modal -->
<div v-if="showShareModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity" @click.self="closeShareModal">
  <div class="bg-white dark:bg-[#1f1f1f] w-full max-w-sm md:max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 p-0 relative m-4">
      
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#333]">
          <h3 class="flex items-center gap-2 text-lg font-bold text-black dark:text-white">
             <Share2 class="w-5 h-5 text-blue-500" />
             Share Episode
          </h3>
          <button @click="closeShareModal" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] transition">
              <X class="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
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
             <input type="text" :value="window?.location?.href || 'https://animewebsite.com/ep/1'" readonly class="flex-1 text-xs text-gray-500 bg-transparent outline-none" />
             <button @click="copyLink" class="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:opacity-80 transition">Copy</button>
          </div>
      </div>
      
  </div>
</div>


  <!-- Subtitle Modal -->
<div v-if="showSubtitleModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity" @click.self="closeSubtitleModal">
  <div class="bg-white dark:bg-[#1f1f1f] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 p-0 relative m-4">
      
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#333]">
          <h3 class="flex items-center gap-2 text-lg font-bold text-black dark:text-white">
             <Subtitles class="w-5 h-5 text-yellow-500" />
             Subtitle File
          </h3>
          <button @click="closeSubtitleModal" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] transition">
              <X class="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
      </div>
      
      <div class="p-5">
          <div class="space-y-4">
              
             <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-[#444] rounded-xl cursor-pointer bg-gray-50 dark:bg-[#252525] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud class="w-8 h-8 mb-2 text-gray-400" />
                    <p class="text-sm font-semibold text-gray-500 dark:text-gray-400">Click to select subtitle file</p>
                    <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">SRT, VTT (Max 2MB)</p>
                </div>
                <input type="file" class="hidden" accept=".srt,.vtt" @change="handleFileUpload" />
             </label>

             <div class="relative flex items-center justify-center">
                <div class="absolute inset-0 flex items-center"><span class="w-full border-t border-gray-200 dark:border-[#333]"></span></div>
                <span class="relative px-3 text-xs text-gray-500 bg-white dark:bg-[#1f1f1f]">Or choose from the list</span>
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


  <!-- Server Modal -->
<div v-if="showServerModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity" @click.self="closeServerModal">
  <div class="bg-white dark:bg-[#1f1f1f] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 p-0 relative m-4">
      
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#333]">
          <h3 class="flex items-center gap-2 text-lg font-bold text-black dark:text-white">
             <Globe class="w-5 h-5 text-purple-500" />
             Change Server
          </h3>
          <button @click="closeServerModal" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] transition">
              <X class="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
      </div>
      
      <div class="p-5">
          <div class="space-y-3">
              
              <button 
                v-for="(video, idx) in props.videos" 
                :key="idx" 
                @click="changeServer(video.video_url)"
                class="flex items-center justify-between w-full p-4 border border-gray-200 dark:border-[#333] rounded-xl hover:bg-purple-50 dark:hover:bg-[#2a2a2a] transition group"
              >
                  <div class="flex items-center gap-3">
                      <div class="flex items-center justify-center w-10 h-10 text-purple-600 bg-purple-100 rounded-full dark:bg-purple-900/20 dark:text-purple-400">
                          <Globe class="w-5 h-5" />
                      </div>
                      <div class="flex flex-col items-start">
                          <span class="text-sm font-bold text-gray-900 dark:text-white">{{ video.server_name || `Server ${idx + 1}` }}</span>
                          <span class="text-xs text-gray-500 dark:text-gray-400">High Quality FHD</span>
                      </div>
                  </div>
                  
                  <div v-if="currentVideo.includes(video.video_url)" class="flex items-center justify-center w-6 h-6 text-white bg-green-500 rounded-full">
                      <Check class="w-4 h-4" />
                  </div>
              </button>
              
              <div v-if="props.videos.length === 0" class="py-4 text-center text-gray-500">
                  No additional servers available currently.
              </div>
              
          </div>
      </div>
      
  </div>
</div>


  <AppLayout class="bg-[#f9f9f9] dark:bg-[#0f0f0f] min-h-screen font-sans">
    <div dir="rtl" class="max-w-[1600px] mx-auto px-0 md:px-4 py-0 md:py-4 direction-rtl ">
      <div class="grid items-start grid-cols-1 gap-0 md:gap-6 lg:grid-cols-12">
        
        <!-- Main Content (Video + Details + Comments) -->
        <div class="flex flex-col lg:col-span-8 xl:col-span-8">
          
          <!-- Video Player -->
       <div class="relative w-full overflow-hidden bg-black rounded-none shadow-lg aspect-video md:rounded-xl">
    <template v-if="currentVideo">
        <iframe 
            :src="currentVideo" 
            class="absolute top-0 left-0 w-full h-full" 
            loading="eager" 
            frameborder="0" 
            allowfullscreen 
            allow="autoplay; encrypted-media; picture-in-picture">
        </iframe>
    </template>
    <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
        <Zap class="w-16 h-16 mb-4 opacity-50" />
        <span class="text-lg font-medium">Video Not Available</span>
    </div>
</div>


          <!-- Episode Details (YouTube Style) -->
      <div class="px-3 mt-4 md:px-0">
    
    <!-- Title -->
    <h1 class="text-xl md:text-2xl font-bold text-[#0f0f0f] dark:text-[#f1f1f1] mb-3 leading-snug">
        {{ props.episode.episode_number }} - {{ props.episode.title || props.series.name }}
    </h1>

    <!-- Anime Info & Actions Row -->
    <div class="flex flex-col justify-between gap-4 mb-4 md:flex-row md:items-center">
        <!-- Anime Info -->
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-[#272727] flex-shrink-0 cursor-pointer">
                 <img :src="getImageUrl(props.series.cover)" class="object-cover w-full h-full" />
            </div>
            <div class="flex flex-col">
                <h3 class="text-base font-bold text-[#0f0f0f] dark:text-[#f1f1f1] line-clamp-1 cursor-pointer" :title="props.series.name">
                    {{ props.series.name }}
                </h3>
                <span class="text-xs text-gray-500 dark:text-gray-400">1.2M subscribers</span>
            </div>
            <button class="mr-2 md:mr-4 px-4 py-2 bg-black dark:bg-[#f1f1f1] text-white dark:text-black text-sm font-bold rounded-full hover:opacity-90 transition">
                Subscribe
            </button>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 pb-2 overflow-x-auto custom-scrollbar md:pb-0">
             <div class="flex items-center bg-gray-100 dark:bg-[#272727] rounded-full overflow-hidden flex-shrink-0">
                 <button class="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition border-l border-gray-300 dark:border-[#3f3f3f]">
                     <ThumbsUp class="w-5 h-5 text-[#0f0f0f] dark:text-[#f1f1f1]" />
                     <span class="text-sm font-medium text-[#0f0f0f] dark:text-[#f1f1f1]">1.2K</span>
                 </button>
                 <button class="px-3 py-2 hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition">
                     <ThumbsDown class="w-5 h-5 text-[#0f0f0f] dark:text-[#f1f1f1]" />
                 </button>
             </div>
             
             <button @click="openShareModal" class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#272727] rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition flex-shrink-0">
                 <Share2 class="w-5 h-5 text-[#0f0f0f] dark:text-[#f1f1f1]" />
                 <span class="text-sm font-medium text-[#0f0f0f] dark:text-[#f1f1f1]">Share</span>
             </button>

             <button @click="openServerModal" class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#272727] rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition flex-shrink-0">
                 <Globe class="w-5 h-5 text-[#0f0f0f] dark:text-[#f1f1f1]" />
                 <span class="text-sm font-medium text-[#0f0f0f] dark:text-[#f1f1f1]">Server</span>
             </button>

             <button @click="openDownloadModal" class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#272727] rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition flex-shrink-0">
                 <Download class="w-5 h-5 text-[#0f0f0f] dark:text-[#f1f1f1]" />
                 <span class="text-sm font-medium text-[#0f0f0f] dark:text-[#f1f1f1]">Download</span>
             </button>
             
             <button class="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-[#272727] rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition flex-shrink-0">
                 <MoreVertical class="w-5 h-5 text-[#0f0f0f] dark:text-[#f1f1f1]" />
             </button>
        </div>
    </div>

    <!-- Description Box -->
    <div 
        class="bg-gray-100 dark:bg-[#272727] rounded-xl p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition mb-6"
        @click="isDescriptionExpanded = !isDescriptionExpanded"
    >
        <div class="flex items-center gap-2 text-sm font-bold text-[#0f0f0f] dark:text-[#f1f1f1] mb-2">
            <span>{{ props.allEpisodes.length * 1500 }} views</span>
            <span>•</span>
            <span>{{ props.episode.created_at ? new Date(props.episode.created_at).toLocaleDateString('en-US') : '2 days ago' }}</span>
        </div>
        <div class="text-sm text-[#0f0f0f] dark:text-[#f1f1f1] whitespace-pre-wrap leading-relaxed">
            <span v-if="!isDescriptionExpanded">
                {{ truncate(props.series.description || 'This anime story revolves around exciting adventures...', 150) }}
            </span>
            <span v-else>
                {{ props.series.description || 'This anime story revolves around exciting adventures and unique characters striving to achieve their dreams in a world full of challenges and mysteries. (This is placeholder text since no description is available).' }}
            </span>
        </div>
        <button class="mt-2 text-sm font-bold text-[#0f0f0f] dark:text-[#f1f1f1]">
            {{ isDescriptionExpanded ? 'Show Less' : 'More' }}
        </button>
    </div>

    <!-- Mobile Episodes List (Visible only on Mobile) -->
    <div class="block mb-8 lg:hidden">
        <h3 class="text-lg font-bold text-[#0f0f0f] dark:text-[#f1f1f1] mb-4">Episodes</h3>
        <div class="flex flex-col gap-3">
            <Link v-for="ep in visibleMobileEpisodes" :key="ep.id" :href="`/en/episodes/${ep.id}`" class="flex gap-3 cursor-pointer group p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1f1f1f] transition-colors border border-transparent hover:border-gray-200 dark:hover:border-[#333]">
                <div class="relative w-[140px] h-[80px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-[#272727]">
                    <img :src="getImageUrl(ep.banner || props.series.cover)" class="object-cover w-full h-full" loading="lazy" />
                    <span class="absolute px-1 text-[10px] font-bold text-white rounded-sm bottom-1 right-1 bg-black/80">{{ formatDuration(ep.duration) }}</span>
                    <div v-if="ep.id === props.episode.id" class="absolute inset-0 flex items-center justify-center text-xs font-bold tracking-wider text-white uppercase bg-black/60">Now Playing</div>
                </div>
                <div class="flex flex-col justify-center flex-1 min-w-0">
                    <h4 class="text-sm font-bold text-[#0f0f0f] dark:text-[#f1f1f1] line-clamp-2 leading-tight mb-1">{{ ep.episode_number }} - {{ ep.title || 'Title Not Available' }}</h4>
                    <div class="flex items-center gap-2 text-[11px] text-gray-600 dark:text-[#888]">
                        <span>12K views</span>
                        <span>•</span>
                        <span>3 days ago</span>
                    </div>
                </div>
            </Link>
        </div>
        <button 
          v-if="mobileLimit < props.allEpisodes.length" 
          @click="loadMoreMobile"
          class="w-full mt-4 py-3 bg-gray-100 dark:bg-[#272727] text-[#0f0f0f] dark:text-[#f1f1f1] font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition"
        >
            Load More Episodes
        </button>
    </div>

    <!-- Comments Section (Inline) -->
    <div class="mt-6">
        <div class="flex items-center gap-8 mb-6">
             <h3 class="text-xl font-bold text-[#0f0f0f] dark:text-[#f1f1f1]">{{ comments.length }} Comments</h3>
             <button class="flex items-center gap-2 text-sm font-bold text-[#0f0f0f] dark:text-[#f1f1f1]">
                 <AlignLeft class="w-5 h-5" />
                 <span>Sort By</span>
             </button>
        </div>

        <!-- Add Comment Input -->
        <div class="flex gap-4 mb-8">
             <div class="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-purple-600 rounded-full select-none">
                <img 
                  v-if="authUser?.avatar" 
                  :src="getAvatarUrl(authUser.avatar)" 
                  :alt="authUser.name" 
                  class="object-cover w-full h-full"
                />
                <span 
                  v-else 
                  class="text-lg font-bold text-white"
                >
                  {{ authUser?.name?.charAt(0) || 'U' }}
                </span>
              </div>
             <div class="flex-1">
                 <div class="relative">
                     <textarea 
                        v-model="newComment"
                        @focus="isMainInputFocused = true"
                        placeholder="Add a comment..." 
                        class="w-full bg-transparent border-b border-gray-300 dark:border-[#3f3f3f] focus:border-[#0f0f0f] dark:focus:border-[#f1f1f1] py-2 text-sm text-[#0f0f0f] dark:text-[#f1f1f1] placeholder-gray-500 resize-none outline-none transition-colors min-h-[30px]"
                        rows="1"
                     ></textarea>
                 </div>
                 <div v-if="isMainInputFocused || newComment" class="flex items-center justify-between mt-2 animate-in fade-in slide-in-from-top-1">
                     <div class="relative" ref="mainEmojiContainer">
                         <button @click="toggleMainEmojiPicker" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272727] transition">
                             <Smile class="w-5 h-5 text-[#0f0f0f] dark:text-[#f1f1f1]" />
                         </button>
                         <!-- Emoji Picker -->
                         <div v-if="showMainEmojiPicker" class="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-[#1f1f1f] rounded-lg shadow-xl border border-gray-200 dark:border-[#333] w-[300px] p-2">
                             <div class="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                                 <button v-for="emoji in emojis" :key="emoji" @click="addMainEmoji(emoji)" class="text-xl p-1.5 hover:bg-gray-100 dark:hover:bg-[#333] rounded transition">{{ emoji }}</button>
                             </div>
                         </div>
                     </div>
                     <div class="flex items-center gap-3">
                         <button @click="isMainInputFocused = false; newComment = ''" class="px-4 py-2 text-sm font-bold text-[#0f0f0f] dark:text-[#f1f1f1] hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full transition">Cancel</button>
                         <button :disabled="!newComment" :class="['px-4 py-2 text-sm font-bold rounded-full transition', newComment ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 dark:bg-[#272727] text-gray-500 cursor-not-allowed']">Comment</button>
                     </div>
                 </div>
             </div>
        </div>

        <!-- Comments List -->
        <div class="space-y-6">
            <div v-for="comment in comments" :key="comment.id" class="group">
                <div class="flex gap-4">
                    <img src="/naruto_cover.jpg" class="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-[#272727]" />
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-sm font-bold text-[#0f0f0f] dark:text-[#f1f1f1] cursor-pointer hover:text-blue-500">@{{ comment.user.replace(/\s/g, '') }}</span>
                            <span class="text-xs text-gray-500">{{ comment.date }}</span>
                        </div>
                        <p class="text-sm text-[#0f0f0f] dark:text-[#f1f1f1] leading-relaxed mb-2 whitespace-pre-wrap">{{ comment.content }}</p>
                        
                        <div class="flex items-center gap-4">
                            <button class="flex items-center gap-1.5 text-gray-600 dark:text-[#aaa] hover:text-[#0f0f0f] dark:hover:text-white transition">
                                <ThumbsUp class="w-4 h-4" />
                                <span class="text-xs font-medium">{{ comment.likes }}</span>
                            </button>
                            <button class="flex items-center gap-1.5 text-gray-600 dark:text-[#aaa] hover:text-[#0f0f0f] dark:hover:text-white transition">
                                <ThumbsDown class="w-4 h-4" />
                            </button>
                            <button @click="openReplyForm(comment.id)" class="text-xs font-bold text-gray-600 dark:text-[#aaa] hover:bg-gray-100 dark:hover:bg-[#272727] px-3 py-1.5 rounded-full transition">Reply</button>
                        </div>

                        <!-- Reply Input -->
                        <div v-if="activeReplyId === comment.id" class="flex gap-3 mt-3 animate-in fade-in slide-in-from-top-1">
                            <div class="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-purple-600 rounded-full select-none">
                                <img v-if="authUser?.avatar" :src="getAvatarUrl(authUser.avatar)" :alt="authUser.name" class="object-cover w-full h-full"/>
                                <span v-else class="text-lg font-bold text-white">{{ authUser?.name?.charAt(0) || 'U' }}</span>
                            </div>
                            <div class="flex-1">
                                <textarea v-model="replyText" placeholder="Add a reply..." class="w-full bg-transparent border-b border-gray-300 dark:border-[#3f3f3f] focus:border-[#0f0f0f] dark:focus:border-[#f1f1f1] py-1 text-sm text-[#0f0f0f] dark:text-[#f1f1f1] resize-none outline-none min-h-[24px]" rows="1" autoFocus></textarea>
                                <div class="flex items-center justify-between mt-2">
                                    <div class="relative" :ref="(el) => activeReplyContainer = el as HTMLElement">
                                         <button @click="toggleReplyEmojiPicker" class="text-gray-500 hover:text-[#0f0f0f] dark:hover:text-white"><Smile class="w-4 h-4" /></button>
                                         <div v-if="showReplyEmojiPicker" class="absolute top-full right-0 z-50 bg-white dark:bg-[#1f1f1f] rounded shadow-xl border border-gray-200 dark:border-[#333] w-[250px] h-[150px] overflow-y-auto grid grid-cols-8 gap-1 p-1">
                                             <button v-for="emoji in emojis" :key="emoji" @click="addReplyEmoji(emoji)" class="hover:bg-gray-100 dark:hover:bg-[#333] rounded">{{ emoji }}</button>
                                         </div>
                                    </div>
                                    <div class="flex gap-2">
                                        <button @click="cancelReply" class="px-3 py-1.5 text-xs font-bold text-[#0f0f0f] dark:text-[#f1f1f1] hover:bg-gray-100 dark:hover:bg-[#272727] rounded-full transition">Cancel</button>
                                        <button :disabled="!replyText" :class="['px-3 py-1.5 text-xs font-bold rounded-full transition', replyText ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 dark:bg-[#272727] text-gray-500 cursor-not-allowed']">Reply</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Replies List -->
                        <div v-if="comment.replies && comment.replies.length > 0" class="mt-2">
                            <button @click="toggleExpandedReplies(comment.id)" class="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-full transition w-fit">
                                <ChevronDown v-if="!expandedReplies.has(comment.id)" class="w-4 h-4" />
                                <ChevronUp v-else class="w-4 h-4" />
                                <span>{{ expandedReplies.has(comment.id) ? 'Hide Replies' : `${comment.replies.length} Replies` }}</span>
                            </button>
                            
                            <div v-if="expandedReplies.has(comment.id)" class="pr-4 mt-2 space-y-3">
                                <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-3">
                                    <img src="/naruto_cover.jpg" class="w-6 h-6 rounded-full object-cover bg-gray-200 dark:bg-[#272727]" />
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-0.5">
                                            <span class="text-xs font-bold text-[#0f0f0f] dark:text-[#f1f1f1] hover:text-blue-500 cursor-pointer">@{{ reply.user }}</span>
                                            <span class="text-[10px] text-gray-500">{{ reply.date }}</span>
                                        </div>
                                        <p class="text-sm text-[#0f0f0f] dark:text-[#f1f1f1] whitespace-pre-wrap">{{ reply.content }}</p>
                                        <div class="flex items-center gap-3 mt-1">
                                            <button class="flex items-center gap-1 text-gray-600 dark:text-[#aaa] hover:text-[#0f0f0f] dark:hover:text-white transition"><ThumbsUp class="w-3 h-3" /></button>
                                            <button class="flex items-center gap-1 text-gray-600 dark:text-[#aaa] hover:text-[#0f0f0f] dark:hover:text-white transition"><ThumbsDown class="w-3 h-3" /></button>
                                            <button class="text-xs font-bold text-gray-600 dark:text-[#aaa] hover:bg-gray-100 dark:hover:bg-[#272727] px-2 py-1 rounded-full transition">Reply</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

        </div>

        <!-- Sidebar (Episodes List - Desktop Only) -->
<div class="hidden lg:flex sticky flex-col px-3 lg:col-span-4 xl:col-span-4 top-6 md:px-0 h-[calc(100vh-100px)]">
    <div class="flex flex-col h-full gap-4">
        <!-- Search Box -->
        <div class="relative flex-shrink-0 mt-4 group md:mt-0">
            <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search in episodes..." 
                :class="[
                    'w-full pl-10 pr-4 py-2 bg-transparent border rounded-full text-sm text-[#0f0f0f] dark:text-white transition-all placeholder-gray-600 dark:bg-[#121212]', 
                    isSearchInvalid ? 'border-red-500' : 'border-gray-300 dark:border-[#3f3f3f] focus:border-blue-500'
                ]" 
            />
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>
     
        <!-- Episodes List -->
        <div 
            class="flex flex-col flex-1 w-full gap-3 pr-1 overflow-y-auto custom-scrollbar"
            @scroll="handleDesktopScroll"
        >
            <Link 
                v-for="ep in visibleDesktopEpisodes" 
                :key="ep.id" 
                :href="`/en/episodes/${ep.id}`" 
                class="flex gap-2.5 cursor-pointer group p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1f1f1f] transition-colors"
            >
                <div class="relative w-[150px] h-[86px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-[#272727]">
                    <img :src="getImageUrl(ep.banner || props.series.cover)" class="object-cover w-full h-full" loading="lazy" />
                    <span class="absolute px-1 text-[10px] font-bold text-white rounded-sm bottom-1 right-1 bg-black/80">{{ formatDuration(ep.duration) }}</span>
                    <div v-if="ep.id === props.episode.id" class="absolute inset-0 flex items-center justify-center text-xs font-bold tracking-wider text-white uppercase bg-black/60">Now Playing</div>
                </div>
                <div class="flex flex-col flex-1 min-w-0 py-0.5">
                    <h4 class="text-[14px] font-bold text-[#0f0f0f] dark:text-[#f1f1f1] line-clamp-2 leading-tight mb-1" :title="ep.title">
                        {{ ep.episode_number }} - {{ ep.title || 'Title Not Available' }}
                    </h4>
                    <div class="text-[11px] text-gray-600 dark:text-[#aaaaaa] font-medium mb-0.5">{{ props.series.name }}</div>
                    <div class="flex items-center gap-2 text-[12px] text-gray-600 dark:text-[#888]">
                        <span>12K views</span>
                        <span>•</span>
                        <span>3 days ago</span>
                    </div>
                    <div class="flex items-center gap-2 text-[12px] text-gray-700 dark:text-[#888]">
                        <span>{{ truncate(ep.description_en, 70) }}</span>
                    </div>
                </div>
                <button class="opacity-0 group-hover:opacity-100 self-start text-[#0f0f0f] dark:text-[#f1f1f1] p-1">
                    <MoreVertical class="w-4 h-4" />
                </button>
            </Link>
        </div>
    </div>
</div>


      </div>
    </div>
  </AppLayout>
</template>