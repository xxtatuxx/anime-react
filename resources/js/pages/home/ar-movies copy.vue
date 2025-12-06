<script setup lang="ts">
import AppLayout from '@/layouts/AR-HomeLayout.vue';
import { Head, Link, usePage, router as inertia } from '@inertiajs/vue3';
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { toast } from 'vue-sonner';
import { useAuth } from '@/composables/useAuth';
// استيراد الأيقونات لتناسب التصميم الجديد
import { 
  Search, 
  Filter, 
  X, 
  Film, 
  Star, 
  Play, 
  ChevronRight, 
  ChevronLeft,
  RefreshCw 
} from 'lucide-vue-next';

const breadcrumbs = [
  { title: 'Movies', href: '/movies' },
];

const page = usePage<{
  animes: any,
  categories: any[],
  seasons: any[],
  flash?: { success?: string },
  auth: { user: any }
}>();

const animes = ref([...page.props.animes.data]);
const nextPageUrl = ref(page.props.animes.next_page_url);
const prevPageUrl = ref(page.props.animes.prev_page_url);
const currentPage = ref(page.props.animes.current_page || 1);
const lastPage = ref(page.props.animes.last_page || 1);
const search = ref('');
const loading = ref(false);

// فلترة
const showFilter = ref(false);

// خيارات الفلترة
const selectedStatus = ref('');
const selectedCategory = ref('');
const selectedSeason = ref('');
const categories = ref(page.props.categories || []);
const seasons = ref(page.props.seasons || []);

// الصلاحيات (تم الإبقاء عليها للمنطق الخلفي)
const { can } = useAuth();

// جلب البيانات مع الفلاتر والبحث
const fetchFilteredAnimes = (pageUrl?: string) => {
  if (loading.value) return;
  loading.value = true;

  inertia.get(pageUrl || route('ar.movies'), {
    search: search.value,
    status: selectedStatus.value,
    category: selectedCategory.value,
    season: selectedSeason.value
  }, {
    preserveState: true,
    preserveScroll: true,
    only: ['animes'],
    onSuccess: (res) => {
      animes.value = res.props.animes.data;
      nextPageUrl.value = res.props.animes.next_page_url;
      prevPageUrl.value = res.props.animes.prev_page_url;
      currentPage.value = res.props.animes.current_page;
      lastPage.value = res.props.animes.last_page;
    },
    onFinish: () => loading.value = false
  });
};

// البحث والفلاتر
watch(search, () => fetchFilteredAnimes());
watch([selectedStatus, selectedCategory, selectedSeason], () => fetchFilteredAnimes());

// إعادة الفلاتر
const resetFilters = () => {
  search.value = '';
  selectedStatus.value = '';
  selectedCategory.value = '';
  selectedSeason.value = '';
  fetchFilteredAnimes();
};

// Pagination
const goToPage = (pageNumber: number) => {
  fetchFilteredAnimes(`${route('ar.movies')}?page=${pageNumber}&search=${search.value}&status=${selectedStatus.value}&category=${selectedCategory.value}&season=${selectedSeason.value}`);
};

// تحميل المزيد (Scroll)
const loadMore = () => {
  if (!nextPageUrl.value || loading.value) return;
  fetchFilteredAnimes(nextPageUrl.value);
};

const onScroll = () => {
  const scrollPos = window.innerHeight + window.scrollY;
  const bottom = document.documentElement.offsetHeight - 50;
  if (scrollPos >= bottom && nextPageUrl.value) loadMore();
};

onMounted(() => {
  if (page.props.flash?.success) {
    toast.success(page.props.flash.success);
    page.props.flash.success = null;
  }
  window.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<template>
  <Head title="الأفلام - AnimeLast" />
  
  <AppLayout :breadcrumbs="breadcrumbs">
    <div dir="rtl" class="min-h-screen bg-[#f9f9f9] dark:bg-[#0f0f0f] font-cairo pb-12 text-right">
      
      <div class="max-w-[1600px] mx-auto px-4 md:px-6 py-8 space-y-8">
        
        <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                    <Film class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">قائمة الأفلام</h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400">تصفح أحدث وأقوى أفلام الأنمي</p>
                </div>
            </div>

            <div class="flex flex-col w-full gap-3 md:flex-row md:w-auto">
                 <div class="relative w-full md:w-80">
                    <Search class="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                    <input 
                        v-model="search"
                        type="text" 
                        placeholder="بحث عن فيلم..." 
                        class="w-full pr-10 pl-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-full text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    />
                </div>
                
                <div class="flex gap-2">
                    <button 
                        @click="showFilter = !showFilter" 
                        class="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold transition-all border rounded-full group"
                        :class="showFilter 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#333] hover:border-purple-500 hover:text-purple-600'"
                    >
                        <Filter class="w-4 h-4" />
                        <span>فلترة</span>
                    </button>

                    <button 
                        @click="resetFilters" 
                        title="إعادة تعيين"
                        class="flex items-center justify-center w-10 h-10 transition-all bg-white border border-gray-200 rounded-full dark:bg-[#1a1a1a] dark:border-[#333] hover:text-red-500 hover:border-red-500 text-gray-500"
                    >
                        <RefreshCw class="w-4 h-4" :class="{'animate-spin': loading}" />
                    </button>
                </div>
            </div>
        </div>

        <transition name="fade-slide">
            <div v-if="showFilter" class="p-6 bg-white border border-gray-100 shadow-xl dark:bg-[#1a1a1a] dark:border-[#333] rounded-2xl">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div class="space-y-2">
                        <label class="text-xs font-bold text-gray-500">الحالة</label>
                        <select v-model="selectedStatus" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-xl text-sm outline-none focus:border-purple-500">
                            <option value="">الكل</option>
                            <option value="Active">يعرض الأن</option>
                            <option value="completed">مكتمل</option>
                        </select>
                    </div>

                    <div class="space-y-2">
                         <label class="text-xs font-bold text-gray-500">التصنيف</label>
                        <select v-model="selectedCategory" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-xl text-sm outline-none focus:border-purple-500">
                            <option value="">كل التصنيفات</option>
                            <option v-for="category in categories" :key="category.id" :value="category.name">{{ category.name }}</option>
                        </select>
                    </div>

                    <div class="space-y-2">
                         <label class="text-xs font-bold text-gray-500">الموسم</label>
                        <select v-model="selectedSeason" class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-xl text-sm outline-none focus:border-purple-500">
                            <option value="">كل المواسم</option>
                            <option v-for="season in seasons" :key="season.id" :value="season.id">{{ season.name }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </transition>

        <div v-if="animes.length > 0" class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <div 
                v-for="anime in animes" 
                :key="anime.id" 
                class="group flex flex-col bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#333] rounded-xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg transition-all cursor-pointer"
            >
                <Link :href="route('animes.show', anime.id)" class="relative aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <img 
                        v-if="anime.image" 
                        :src="`/storage/${anime.image}`" 
                        class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    <div v-else class="flex items-center justify-center w-full h-full text-xs text-gray-400">No Image</div>
                    
                    <div class="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 group-hover:opacity-100">
                         <div class="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90">
                            <Play class="w-5 h-5 ml-1 text-white fill-current" />
                         </div>
                    </div>

                    <div class="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        FILM
                    </div>
                </Link>

                <div class="flex flex-col flex-1 p-3">
                    <div class="flex items-start justify-between mb-1">
                        <Link :href="route('animes.show', anime.id)">
                            <h3 class="text-sm font-bold text-gray-900 transition-colors dark:text-white line-clamp-1 group-hover:text-purple-500" :title="anime.title">
                                {{ anime.title }}
                            </h3>
                        </Link>
                    </div>

                    <div class="flex items-center gap-2 mb-2">
                        <div class="flex items-center gap-1 text-xs font-bold text-yellow-500">
                            <Star class="w-3 h-3 fill-current" />
                            <span>{{ anime.rating || 'N/A' }}</span>
                        </div>
                        <span class="text-[10px] text-gray-300">|</span>
                        <span class="text-[10px]" :class="anime.is_active ? 'text-green-500' : 'text-blue-500'">
                            {{ anime.is_active ? 'مستمر' : 'مكتمل' }}
                        </span>
                    </div>

                    <p class="mt-auto text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                         {{ anime.description || 'لا يوجد وصف متاح.' }}
                    </p>
                </div>
            </div>
        </div>

        <div v-else-if="!loading" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="p-4 mb-4 bg-gray-100 rounded-full dark:bg-gray-800">
                <Search class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">لم يتم العثور على نتائج</h3>
            <p class="text-gray-500">حاول البحث بكلمات مختلفة أو تغيير الفلاتر</p>
            <button @click="resetFilters" class="mt-4 text-purple-600 hover:underline">إعادة تعيين الفلاتر</button>
        </div>

        <div v-if="loading && animes.length === 0" class="py-20 text-center">
            <p class="text-gray-500">جاري التحميل...</p>
        </div>

        <div v-if="lastPage > 1" class="flex items-center justify-center gap-2 mt-8 dir-ltr">
            <button 
                :disabled="currentPage === 1" 
                @click="goToPage(currentPage - 1)" 
                class="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full dark:bg-[#1a1a1a] dark:border-[#333] hover:border-purple-500 hover:text-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight class="w-5 h-5" />
            </button>
            
            <span class="px-4 py-2 text-sm font-bold bg-white border border-gray-200 rounded-full dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white">
                {{ currentPage }} / {{ lastPage }}
            </span>

            <button 
                :disabled="currentPage === lastPage" 
                @click="goToPage(currentPage + 1)" 
                class="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full dark:bg-[#1a1a1a] dark:border-[#333] hover:border-purple-500 hover:text-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft class="w-5 h-5" />
            </button>
        </div>

      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }
.fade-slide-enter-to, .fade-slide-leave-from { opacity: 1; transform: translateY(0); }

/* تنسيق شريط التمرير */
::-webkit-scrollbar {
    width: 8px;
}
::-webkit-scrollbar-track {
    background: #1a1a1a; 
}
::-webkit-scrollbar-thumb {
    background: #333; 
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: #7c3aed; /* لون البنفسجي */
}
</style>