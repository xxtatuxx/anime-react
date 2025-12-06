<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { Episode, Series, EpisodeVideo, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/vue3';
import { Clock, Calendar, Globe, Star, Zap, Link } from 'lucide-vue-next';

// تحديد الواجهات (Interfaces)
interface Series {
    id: number;
    title: string;
    cover: string | null;
    // ... يمكن إضافة حقول أخرى من الـ Series
}

// ... الكود السابق

// دالة لتنسيق التاريخ
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'قريباً';
    
    // استخدام Date API في JavaScript لتحويل سلسلة ISO
    try {
        const date = new Date(dateString);
        
        // خيارات التنسيق لـ Locale العربي
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        // تنسيق التاريخ
        return date.toLocaleDateString('ar-EG', options);
    } catch (e) {
        return dateString.split('T')[0]; // عرض الجزء YYYY-MM-DD في حال وجود خطأ
    }
};

// ... الكود اللاحق

interface Episode {
    id: number;
    title: string;
    episode_number: number;
    banner: string | null;
    release_date: string | null;
    duration: number | null;
    language: string | null;
    rating: number | null;
    description: string | null;
    description_en: string | null;
    series_id: number;
    // ... يمكن إضافة حقول أخرى من الـ Episode
}

interface EpisodeVideo {
    id: number;
    video_url: string;
    // ...
}

// تحديد الـ Props القادمة من الكنترولر
const props = defineProps<{
    episode: Episode & { videos: EpisodeVideo[] };
    series: Series;
    videos: EpisodeVideo[];
}>();

// مسارات التنقل (Breadcrumbs)
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Episodes', href: '/episodes' },
    { title: props.episode.title ?? 'Details', href: `/episodes/${props.episode.id}` },
];

// دالة لتنسيق مدة العرض (بالدقائق) إلى تنسيق HH:MM
const formatDuration = (minutes: number | undefined | null) => {
    if (!minutes) return 'غير محدد';
    const totalMinutes = Math.floor(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    if (hours > 0) {
        return `${hours} س: ${remainingMinutes} د`;
    }
    return `${remainingMinutes} دقيقة`;
};

// دالة لمعالجة مسار الصورة
const getImageUrl = (path: string | null | undefined) => {
    // افترض وجود صورة افتراضية في حال عدم وجود مسار
    return path ? `/storage/${path}` : '/images/placeholder.jpg'; 
}
</script>

<template>
    <Head :title="props.episode.title ?? 'تفاصيل الحلقة'" />

    <AppLayout :breadcrumbs="breadcrumbs" class="font-cairo bg-gray-50 dark:bg-neutral-900/90">
        
        <header class="relative w-full h-80 overflow-hidden shadow-2xl">
            <img :src="getImageUrl(props.episode.banner || props.series.cover)" 
                 :alt="props.episode.title" 
                 class="object-cover w-full h-full" />
            
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent via-black/20"></div>
            
            <div class="absolute bottom-0 left-0 right-0 h-10 bg-gray-50 dark:bg-neutral-900/90 rounded-t-[40px] 
                        transform translate-y-full blur-xl opacity-70"></div>
            
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p class="text-lg font-medium drop-shadow-md text-gray-300">
                    {{ props.series.title }} - حلقة رقم {{ props.episode.episode_number }}
                </p>
                <h1 class="text-4xl font-extrabold mb-1 drop-shadow-lg">
                    {{ props.episode.title }}
                </h1>
            </div>
        </header>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-30px] mb-20 space-y-12 relative z-10">
            
            <div class="p-8 bg-white dark:bg-neutral-900 shadow-2xl rounded-3xl">
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-3 border-neutral-200 dark:border-700">
                    🎬 نظرة عامة
                </h2>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
                    <div class="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl shadow-inner border border-neutral-200 dark:border-neutral-700">
                        <Clock class="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">المدة: **{{ formatDuration(props.episode.duration) }}**</span>
                    </div>
                    <div class="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl shadow-inner border border-neutral-200 dark:border-neutral-700">
                        <Calendar class="w-6 h-6 mx-auto mb-1 text-blue-500" />
<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
    الإصدار: **{{ formatDate(props.episode.release_date) }}**
</span>                    </div>
                    <div class="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl shadow-inner border border-neutral-200 dark:border-neutral-700">
                        <Globe class="w-6 h-6 mx-auto mb-1 text-green-500" />
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">اللغة: **{{ props.episode.language || 'غير محدد' }}**</span>
                    </div>
                    <div class="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl shadow-inner border border-neutral-200 dark:border-neutral-700">
                        <Star class="w-6 h-6 mx-auto mb-1 text-amber-500" />
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">التقييم: **{{ props.episode.rating?.toFixed(1) || 'N/A' }} / 10**</span>
                    </div>
                </div>

                <div class="space-y-4 text-gray-700 dark:text-gray-300 mt-8">
                    <h3 class="text-xl font-bold dark:text-white border-b pb-2 border-neutral-100 dark:border-neutral-800">الوصف (عربي):</h3>
                    <p class="leading-relaxed text-base">
                        {{ props.episode.description || 'لا يتوفر وصف حالي لهذه الحلقة.' }}
                    </p>
                    <div v-if="props.episode.description_en">
                        <h3 class="text-xl font-bold dark:text-white border-b pt-4 pb-2 border-neutral-100 dark:border-neutral-800">Description (EN):</h3>
                        <p class="leading-relaxed text-base">
                            {{ props.episode.description_en }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="p-8 bg-white dark:bg-neutral-900 shadow-2xl rounded-3xl">
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-3 border-neutral-200 dark:border-neutral-700">
                    🔗 روابط المشاهدة
                </h2>

                <div v-if="props.videos && props.videos.length" class="space-y-4">
                    <div v-for="(video, index) in props.videos" :key="video.id"
                         class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-blue-300 dark:border-blue-700/50 rounded-xl transition duration-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/30">
                        
                        <div class="flex items-center gap-3 mb-2 sm:mb-0">
                            <Zap class="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <span class="text-lg font-medium text-gray-800 dark:text-gray-100">
                                رابط المشاهدة رقم {{ index + 1 }}
                            </span>
                        </div>
                        
                        <a :href="video.video_url" target="_blank" rel="noopener noreferrer"
                           class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-semibold text-sm shadow-md hover:bg-blue-700 transition duration-300 flex-shrink-0">
                            <Link class="w-4 h-4" />
                            <span>مشاهدة مباشرة</span>
                        </a>
                    </div>
                </div>
                <div v-else class="text-center p-6 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-gray-500 dark:text-gray-400">
                    <p>لا تتوفر روابط مشاهدة لهذه الحلقة حالياً.</p>
                </div>
            </div>
            
            <div class="flex justify-end pt-4">
                <a :href="route('episodes.index')" class="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 rtl:rotate-180">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    العودة لقائمة الحلقات
                </a>
            </div>

        </div>
    </AppLayout>
</template>

<style>
/* **ملاحظة هامة:** يجب التأكد من تحميل خط Cairo في ملف CSS العام للمشروع.
    مثال (إذا كنت تستخدم Google Fonts في ملف CSS رئيسي):
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
*/
.font-cairo {
    font-family: 'Cairo', sans-serif;
}
</style>