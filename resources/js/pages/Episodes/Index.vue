<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { Episode, type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router as inertia } from '@inertiajs/vue3';
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { toast } from 'vue-sonner';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Eye } from 'lucide-vue-next';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Episodes', href: '/episodes' },
];

const page = usePage<{
  episodes: { data: Episode[]; next_page_url?: string };
  flash?: { success?: string };
  filters?: { search?: string };
  auth: { user: any };
}>();

const episodes = ref<Episode[]>([]);
const allEpisodes = ref<Episode[]>([]);
const nextPageUrl = ref<string | null>(null);
const search = ref(page.props.filters?.search || '');
const initialLoading = ref(true); // Skeleton التحميل الأولي
const loadingMore = ref(false); // Skeleton عند النزول
const currentPage = ref(1); // الصفحة الحالية للتحكم بالتحميل بدون تغيير الرابط

// عرض إشعارات الفلاش
if (page.props.flash?.success) {
  toast.success(page.props.flash.success);
  page.props.flash.success = null;
}

// البحث
watch(search, (value) => {
  currentPage.value = 1;
  inertia.get(
    '/episodes',
    { search: value, page: currentPage.value },
    {
      preserveState: true,
      replace: true,
      onStart: () => (initialLoading.value = true),
      onSuccess: (pageResponse) => {
        episodes.value = pageResponse.props.episodes.data;
        allEpisodes.value = pageResponse.props.episodes.data;
        nextPageUrl.value = pageResponse.props.episodes.next_page_url;
      },
      onFinish: () => (initialLoading.value = false),
    }
  );
});

// حذف الحلقة
const deleteEpisode = (id: number) => {
  if (!confirm('هل أنت متأكد من حذف هذه الحلقة؟')) return;

  inertia.delete(route('episodes.destroy', id), {
    onSuccess: () => {
      episodes.value = episodes.value.filter((e) => e.id !== id);
      allEpisodes.value = allEpisodes.value.filter((e) => e.id !== id);
      toast.success('تم حذف الحلقة بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحذف');
    },
  });
};

// تحميل المزيد عند النزول
const loadMore = () => {
  if (loadingMore.value) return;
  if (!nextPageUrl.value) return;

  loadingMore.value = true;
  currentPage.value++;

  inertia.get(
    '/episodes', // الرابط ثابت
    { search: search.value, page: currentPage.value }, // query params داخلي
    {
      preserveScroll: true,
      preserveState: true,
      only: ['episodes'],
      replace: false, // لا تغيّر الرابط في المتصفح
      onSuccess: (pageResponse) => {
        const newData = pageResponse.props.episodes.data;
        const existingIds = new Set(episodes.value.map((e) => e.id));
        const filteredData = newData.filter((e) => !existingIds.has(e.id));
        episodes.value.push(...filteredData);
        allEpisodes.value.push(...filteredData);
        nextPageUrl.value = pageResponse.props.episodes.next_page_url;
      },
      onFinish: () => {
        loadingMore.value = false;
      },
    }
  );
};

const onScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const bottom = document.documentElement.offsetHeight - 50;
  if (scrollPosition >= bottom) {
    loadMore();
  }
};

onMounted(() => {
  // تحميل الصفحة الأولى عند الدخول
  inertia.get('/episodes', { page: currentPage.value }, {
    preserveState: true,
    onSuccess: (pageResponse) => {
      episodes.value = pageResponse.props.episodes.data;
      allEpisodes.value = pageResponse.props.episodes.data;
      nextPageUrl.value = pageResponse.props.episodes.next_page_url;
    },
    onFinish: () => {
      initialLoading.value = false;
    },
  });

  window.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<template>
  <Head>
    <title>Episodes</title>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap"
    />
  </Head>

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex flex-col flex-1 gap-4 p-4 rounded-xl font-[Cairo]">
      <!-- مربع البحث وزر إضافة حلقة -->
      <div class="flex items-center w-full gap-2 mb-4">
        <Input
          v-model="search"
          placeholder="بحث عن الحلقات..."
          class="w-64 h-9 text-sm font-[Cairo]"
        />
        <Link 
          href="/episodes/create"
          class="bg-white-600 text-purple-600 text-sm font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-gray-200 transition-colors"
        >
          + إضافة حلقة
        </Link>
      </div>

      <!-- Skeleton التحميل الأولي -->
      <div
        v-if="initialLoading"
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <div
          v-for="n in 10"
          :key="n"
          role="status"
          class="max-w-sm p-4 rounded-lg shadow animate-pulse dark:border-gray-300"
        >
          <div class="w-full h-40 mb-4 bg-gray-300 rounded-md"></div>
          <div class="h-3 bg-gray-300 rounded-full mb-2.5"></div>
          <div class="w-3/4 h-3 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      <!-- عرض الحلقات بعد التحميل -->
      <div
        v-else
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 font-[Cairo]"
      >
        <div
          v-for="episode in episodes"
          :key="episode.id"
          @click="inertia.visit(route('episodes.show', episode.id))"
          class="relative overflow-hidden transition transform bg-white rounded-lg shadow cursor-pointer dark:bg-black hover:scale-105 hover:shadow-lg"
        >
          <!-- الصورة -->
          <div class="relative">
            <img
              v-if="episode.thumbnail"
              :src="`/storage/${episode.thumbnail}`"
              alt="thumbnail"
              class="object-cover w-full h-40"
            />
            <div
              v-else
              class="flex items-center justify-center w-full h-40 text-gray-500 bg-gray-200 dark:bg-gray-700"
            >
              No Image
            </div>

            <!-- دائرة "يعرض الآن" -->
            <div
              v-if="episode.is_published"
              class="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold rounded-full px-2 py-0.5 shadow-md"
            >
              يعرض الآن
            </div>

            <!-- نوع الفيديو -->
            <div
              v-if="episode.video_format"
              class="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold rounded-full px-2 py-0.5 shadow-md"
            >
              {{ episode.video_format }}
            </div>

            <!-- رقم الحلقة أسفل الصورة -->
            <div
              class="absolute bottom-0 left-0 right-0 py-1 text-xl font-bold text-center text-white bg-black bg-opacity-60"
            >
              {{ episode.episode_number }} الحلقة
            </div>
          </div>

          <!-- بيانات الحلقة -->
          <div class="flex flex-col gap-1 p-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold truncate">{{ episode.title }}</span>
              <span
                v-if="episode.series?.type"
                class="px-2 py-0.5 bg-indigo-500 text-white text-[10px] rounded"
              >
                {{ episode.series.type }}
              </span>
            </div>
          </div>

          <!-- أزرار التحكم -->
          <div
            class="flex justify-around p-2 border-t border-gray-200 dark:border-t-black dark:bg-black bg-gray-50 dark:bg-gray-900"
            @click.stop
          >
            <Link
              :href="route('episodes.show', episode.id)"
              class="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
            >
              <Eye class="w-4 h-4" /> عرض
            </Link>
            <Link
              :href="route('episodes.edit', episode.id)"
              class="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600"
            >
              <Edit class="w-4 h-4" /> تعديل
            </Link>
            <button
              @click="deleteEpisode(episode.id)"
              class="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
            >
              <Trash2 class="w-4 h-4" /> حذف
            </button>
          </div>
        </div>

        <!-- Skeleton عند النزول للأسفل -->
        <div
          v-if="loadingMore"
          class="grid grid-cols-2 gap-4 col-span-full sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          <div
            v-for="n in 5"
            :key="n"
            role="status"
            class="max-w-sm p-4 rounded-lg shadow animate-pulse dark:border-gray-300"
          >
            <div class="w-full h-40 mb-4 bg-gray-300 rounded-md"></div>
            <div class="h-3 bg-gray-300 rounded-full mb-2.5"></div>
            <div class="w-3/4 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- لا توجد بيانات -->
      <div
        v-if="!nextPageUrl && !loadingMore && episodes.length === 0"
        class="py-4 text-center text-gray-500 col-span-full"
      >
        لا توجد حلقات
      </div>
    </div>
  </AppLayout>
</template>

<style>
.loader {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  border: 3px solid;
  border-color: #FFF #FFF transparent transparent;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}
.loader::after,
.loader::before {
  content: '';  
  box-sizing: border-box;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  border: 3px solid;
  border-color: transparent transparent #FF3D00 #FF3D00;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-sizing: border-box;
  animation: rotationBack 0.5s linear infinite;
  transform-origin: center center;
}
.loader::before {
  width: 32px;
  height: 32px;
  border-color: #FFF #FFF transparent transparent;
  animation: rotation 1.5s linear infinite;
}
    
@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
} 
@keyframes rotationBack {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}
</style>
