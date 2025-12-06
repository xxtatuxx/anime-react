<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Head, usePage } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AR-HomeLayout.vue';
import { HardDrive } from 'lucide-vue-next';

// Import Components
import DownloadModal from './component-show-Episodes/DownloadModal.vue';
import ShareModal from './component-show-Episodes/ShareModal.vue';
import SubtitleModal from './component-show-Episodes/SubtitleModal.vue';
import ServerModal from './component-show-Episodes/ServerModal.vue';
import VideoPlayer from './component-show-Episodes/VideoPlayer.vue';
import EpisodeDetails from './component-show-Episodes/EpisodeDetails.vue';
import MobileEpisodesList from './component-show-Episodes/MobileEpisodesList.vue';
import CommentsSection from './component-show-Episodes/CommentsSection.vue';
import DesktopEpisodesSidebar from './component-show-Episodes/DesktopEpisodesSidebar.vue';
import LastEpisodesList from './component-show-Episodes/LastEpisodesList.vue';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
}

// --- Props ---
const props = defineProps<{
  episode: any;
  series: any;
  videos: any[];
  initialSeriesEpisodes: any; // Paginated result
  latestEpisodes: any[];
  comments: any[];
}>();

// --- Auth User & Avatar Logic ---
const page = usePage();
const authUser = computed<User | null>(() => page.props.auth?.user || null);

const getAutoplayUrl = (url: string) => {
  if (!url) return '';
  const separator = url.includes('?') ? '&' : '?';
  let newUrl = url;
 // if (!newUrl.includes('autoplay=1')) newUrl += `${separator}autoplay=1`;
  //if (!newUrl.includes('mute=0')) newUrl += `&mute=0`; 
  return newUrl;
};

const currentVideo = ref(props.videos.length ? getAutoplayUrl(props.videos[0].video_url) : '');

// --- Subtitle Logic ---
const showSubtitleModal = ref(false);
const openSubtitleModal = () => showSubtitleModal.value = true;
const closeSubtitleModal = () => showSubtitleModal.value = false;

// --- Share Modal Logic ---
const showShareModal = ref(false);
const openShareModal = () => showShareModal.value = true;
const closeShareModal = () => showShareModal.value = false;

// --- Smart Search Logic ---
const searchQuery = ref('');
const isSearchInvalid = ref(false);

// Note: Search logic for sidebar is now handled within the sidebar component.
// Mobile search logic still relies on available episodes.
watch(searchQuery, (newValue) => {
  const query = newValue.toLowerCase().trim();
  if (!query) {
    isSearchInvalid.value = false;
    return;
  }
  // Fallback for mobile: search within loaded episodes
  const episodes = props.initialSeriesEpisodes.data || [];
  const matches = episodes.filter((ep: any) => 
    (ep.title || '').toLowerCase().includes(query) || String(ep.episode_number).includes(query)
  );
  isSearchInvalid.value = matches.length === 0;
});

// --- Download Modal Logic ---
const showDownloadModal = ref(false);
const openDownloadModal = () => showDownloadModal.value = true;
const closeDownloadModal = () => showDownloadModal.value = false;

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

const visibleMobileEpisodes = computed(() => {
    let episodes = props.initialSeriesEpisodes.data || [];
    if (searchQuery.value) {
         const query = searchQuery.value.toLowerCase().trim();
         episodes = episodes.filter((ep: any) => 
            (ep.title || '').toLowerCase().includes(query) || String(ep.episode_number).includes(query)
         );
    }
    return episodes.slice(0, mobileLimit.value);
});

const loadMoreMobile = () => { mobileLimit.value += 10; };

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

  <!-- Modals -->
  <DownloadModal 
    :show="showDownloadModal" 
    :episode="props.episode" 
    :series="props.series" 
    :downloadLinks="downloadLinks" 
    @close="closeDownloadModal" 
  />

  <ShareModal 
    :show="showShareModal" 
    @close="closeShareModal" 
  />

  <SubtitleModal 
    :show="showSubtitleModal" 
    :availableSubtitles="availableSubtitles" 
    @close="closeSubtitleModal" 
  />

  <ServerModal 
    :show="showServerModal" 
    :videos="props.videos" 
    :currentVideo="currentVideo" 
    @close="closeServerModal" 
    @change-server="changeServer" 
  />

  <AppLayout class="bg-[#f9f9f9] dark:bg-[#0f0f0f] min-h-screen font-sans">
    <div dir="rtl" class="w-full direction-rtl">
      <div class="grid items-start grid-cols-1 gap-0 md:gap-6 lg:grid-cols-12">
        
        <!-- Main Content (Video + Details + Comments) -->
        <div class="flex flex-col mt-2 lg:col-span-8 xl:col-span-8">
          
          <!-- Video Player -->
          <VideoPlayer :currentVideo="currentVideo" />

          <!-- Episode Details (YouTube Style) -->
          <EpisodeDetails 
            :episode="props.episode" 
            :series="props.series" 
            :allEpisodes="props.initialSeriesEpisodes.data || []" 
            @open-share="openShareModal" 
            @open-server="openServerModal" 
            @open-download="openDownloadModal" 
          />

          <!-- Mobile Episodes List (Visible only on Mobile) -->
          <MobileEpisodesList 
            :visibleMobileEpisodes="visibleMobileEpisodes" 
            :allEpisodes="props.initialSeriesEpisodes.data || []" 
            :mobileLimit="mobileLimit" 
            :episode="props.episode" 
            :series="props.series" 
            :searchQuery="searchQuery"
            @update:searchQuery="searchQuery = $event"
            @load-more="loadMoreMobile" 
          />

          <!-- Comments Section (Inline) -->
          <CommentsSection 
            :comments="props.comments" 
            :authUser="authUser" 
            :episodeId="props.episode.id"
          />
        </div>

        <!-- Sidebar (Episodes List - Desktop Only) -->
        <div class="hidden lg:flex mt-1 flex-col gap-4 lg:col-span-4 xl:col-span-4 top-6 h-[calc(200vh-80px)]">
            <!-- Current Series Episodes -->
            <div class="flex-1 min-h-0">
                <DesktopEpisodesSidebar 
                  :initialEpisodes="props.initialSeriesEpisodes" 
                  :episode="props.episode" 
                  :series="props.series" 
                />
            </div>
              <div class="flex-1 min-h-0">
                <LastEpisodesList 
                  :initialEpisodes="props.latestEpisodes"
                  :episode="props.episode" 
                  :series="props.series" 
                />
            </div>
        </div>

      </div>
    </div>
  </AppLayout>
</template>