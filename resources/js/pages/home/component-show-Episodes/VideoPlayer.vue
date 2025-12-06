  <script setup lang="ts">
  import { Zap } from 'lucide-vue-next';

  defineProps<{
    currentVideo: string;
  }>();

  /**
   * دالة لإصلاح روابط Google Drive لتعمل في iframe
   */
  const getIframeSrc = (url: string) => {
    if (!url) return '';
    
    // إذا الرابط يحتوي على Google Drive
    if (url.includes('drive.google.com')) {
      // نأخذ معرف الملف
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    
    // رابط عادي
    return url;
  };
  </script>

  <template>
    <div class="relative w-full overflow-hidden bg-black rounded-none shadow-lg aspect-video md:rounded-xl">
      <template v-if="currentVideo">
        <iframe
          :src="getIframeSrc(currentVideo)"
          class="absolute top-0 left-0 w-full h-full"
          loading="eager"
          frameborder="0"
          allowfullscreen
          allow="autoplay; encrypted-media; picture-in-picture"
        ></iframe>
      </template>

      <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
        <Zap class="w-16 h-16 mb-4 opacity-50" />
        <span class="text-lg font-medium">الفيديو غير متوفر</span>
      </div>
    </div>
  </template>
