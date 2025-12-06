<script setup lang="ts">
import { ref } from 'vue';
import { MoreVertical, Share2, Clock, Check } from 'lucide-vue-next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import ShareModal from '@/components/ShareModal.vue';
import { usePage } from '@inertiajs/vue3';
import axios from 'axios';

const props = defineProps<{
  episode: any;
}>();

const shareModalOpen = ref(false);
const addingToWatchLater = ref(false);
const addedToWatchLater = ref(false); // Could be initialized based on props if we knew the state

const page = usePage();
const user = (page.props as any).auth.user;

import { toast } from 'vue-sonner';

const handleAddToWatchLater = async () => {
    if (!user) {
        // Redirect to login or show toast
        window.location.href = '/login';
        return;
    }

    addingToWatchLater.value = true;
    try {
        await axios.post('/watch-later', {
            episode_id: props.episode.id
        });
        addedToWatchLater.value = true;
        toast.success('تمت الإضافة إلى قائمة المشاهدة لاحقاً');
        // Reset success state after a while or keep it? 
        // For now let's keep it to show feedback
        setTimeout(() => addedToWatchLater.value = false, 3000);
    } catch (error) {
        console.error('Failed to add to watch later', error);
        toast.error('حدث خطأ أثناء الإضافة');
    } finally {
        addingToWatchLater.value = false;
    }
};

const episodeUrl = computed(() => {
    return `${window.location.origin}/ar/episodes/${props.episode.id}`;
});

import { computed } from 'vue';
</script>

<template>
  <div @click.stop>
      <DropdownMenu>
          <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] text-gray-500 dark:text-gray-400">
                  <MoreVertical class="w-4 h-4" />
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48 bg-white dark:bg-[#1a1a1a] border-gray-100 dark:border-[#333]">
              <DropdownMenuItem @click="shareModalOpen = true" class="cursor-pointer gap-2 text-gray-700 dark:text-gray-200 focus:bg-gray-50 dark:focus:bg-[#2a2a2a]">
                  <Share2 class="w-4 h-4" />
                  <span>مشاركة</span>
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleAddToWatchLater" class="cursor-pointer gap-2 text-gray-700 dark:text-gray-200 focus:bg-gray-50 dark:focus:bg-[#2a2a2a]">
                  <Check v-if="addedToWatchLater" class="w-4 h-4 text-green-500" />
                  <Clock v-else class="w-4 h-4" />
                  <span>{{ addedToWatchLater ? 'تمت الإضافة' : 'مشاهدة لاحقاً' }}</span>
              </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>

      <ShareModal 
        v-model:open="shareModalOpen"
        :url="episodeUrl"
        :title="props.episode.title"
      />
  </div>
</template>
