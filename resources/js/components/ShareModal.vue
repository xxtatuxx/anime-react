<script setup lang="ts">
import { ref, computed } from 'vue';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Facebook, Twitter, MessageCircle } from 'lucide-vue-next';

const props = defineProps<{
  open: boolean;
  url: string;
  title: string;
}>();

const emit = defineEmits(['update:open']);

const copied = ref(false);

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(props.url);
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    } catch (err) {
        console.error('Failed to copy', err);
    }
};

const shareLinks = computed(() => [
    {
        name: 'Facebook',
        icon: Facebook,
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`,
        color: 'bg-[#1877F2] hover:bg-[#166fe5]'
    },
    {
        name: 'Twitter',
        icon: Twitter,
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.title)}&url=${encodeURIComponent(props.url)}`,
        color: 'bg-[#1DA1F2] hover:bg-[#1a94df]'
    },
    {
        name: 'WhatsApp',
        icon: MessageCircle,
        url: `https://wa.me/?text=${encodeURIComponent(props.title + ' ' + props.url)}`,
        color: 'bg-[#25D366] hover:bg-[#22bf5b]'
    }
]);

const openShareLink = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
};
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333]">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold text-center text-gray-900 dark:text-white">مشاركة الحلقة</DialogTitle>
      </DialogHeader>
      
      <div class="flex flex-col gap-6 py-4">
          <!-- Social Buttons -->
          <div class="flex justify-center gap-4">
              <button 
                v-for="link in shareLinks" 
                :key="link.name"
                @click="openShareLink(link.url)"
                :class="['flex items-center justify-center w-12 h-12 rounded-full text-white transition-transform hover:scale-110', link.color]"
                :title="link.name"
              >
                  <component :is="link.icon" class="w-6 h-6" />
              </button>
          </div>

          <!-- Copy Link -->
          <div class="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 dark:bg-[#222] border-gray-200 dark:border-[#333]">
              <div class="flex-1 min-w-0 px-2 text-sm text-gray-600 truncate dark:text-gray-300 font-mono">
                  {{ url }}
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                @click="copyToClipboard"
                class="shrink-0 hover:bg-gray-200 dark:hover:bg-[#333]"
              >
                  <Check v-if="copied" class="w-4 h-4 text-green-500" />
                  <Copy v-else class="w-4 h-4 text-gray-500" />
              </Button>
          </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
