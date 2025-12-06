<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { EpisodeForm, Episode, type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/vue3';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/InputError.vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'vue-sonner';
import { ref, computed, watch } from 'vue';
import { LoaderCircle } from 'lucide-vue-next';

const props = defineProps<{ episode: Episode & { videos?: { id: number; video_url: string }[] } }>();

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Episodes', href: '/episodes' },
    { title: props.episode.title ?? 'Edit', href: `/episodes/${props.episode.id}/edit` },
];

const page = usePage<{ animes: Array<{ 
    id: number; 
    title: string; 
    title_en?: string; 
    slug?: string; 
    slug_en?: string; 
    description?: string; 
    description_en?: string; 
    duration?: number; 
    language?: string; 
    rating?: number; 
    image?: string; 
    cover?: string; 
}> }>();

const form = useForm<EpisodeForm>({
    series_id: props.episode.series_id,
    title: props.episode.title ?? '',
    title_en: props.episode.title_en ?? '',
    slug: props.episode.slug ?? '',
    slug_en: props.episode.slug_en ?? '',
    episode_number: props.episode.episode_number ?? 1,
    description: props.episode.description ?? '',
    description_en: props.episode.description_en ?? '',
    thumbnail: null,
    banner: null,
    video_urls: props.episode.videos?.map(v => v.video_url) ?? [''],
    duration: props.episode.duration ?? undefined,
    quality: props.episode.quality ?? '',
    video_format: props.episode.video_format ?? '',
    release_date: props.episode.release_date ?? '',
    is_published: Boolean(props.episode.is_published),
    language: props.episode.language ?? 'ar',
    subtitles: props.episode.subtitles ?? [],
    rating: props.episode.rating ?? 0,
    _method: 'PUT',
});

const thumbnailPreview = ref<string | null>(props.episode.thumbnail ? `/storage/${props.episode.thumbnail}` : null);
const bannerPreview = ref<string | null>(props.episode.banner ? `/storage/${props.episode.banner}` : null);

const searchQuery = ref('');
const dropdownOpen = ref(false);

const filteredAnimes = computed(() => {
    const q = searchQuery.value.toLowerCase();
    return page.props.animes.filter(
        anime => anime.title.toLowerCase().includes(q) || (anime.title_en && anime.title_en.toLowerCase().includes(q))
    );
});

// ... (داخل <script setup lang="ts">)

watch(() => form.series_id, (newId) => {
    const anime = page.props.animes.find(a => a.id === newId);
    if (anime) {
        // [تعديل] - تحديث الحقول المطلوبة ببيانات المسلسل الجديد
        form.title = anime.title || '';
        form.title_en = anime.title_en || '';
        form.description = anime.description || '';
        form.description_en = anime.description_en || '';
        form.language = anime.language || 'ar'; // تعيين اللغة الافتراضية
        
        // --- تحديث معاينة الصور (كما كان سابقاً) ---
        
        // تحديث معاينة Thumbnail
        if (!form.thumbnail) {
            thumbnailPreview.value = anime.image ? `/storage/${anime.image}` : null;
        }

        // تحديث معاينة Banner
        if (!form.banner) {
            bannerPreview.value = anime.cover ? `/storage/${anime.cover}` : null;
        }
    }
});
const handleFileChange = (event: Event, field: 'thumbnail' | 'banner') => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    form[field] = file;
    const preview = file ? URL.createObjectURL(file) : (field === 'thumbnail' ? thumbnailPreview.value : bannerPreview.value);
    if (field === 'thumbnail') thumbnailPreview.value = preview;
    else bannerPreview.value = preview;
};

const selectAnime = (animeId: number) => {
    form.series_id = animeId;
    dropdownOpen.value = false;
    searchQuery.value = '';
};

const addVideoUrl = () => {
    form.video_urls.push('');
};

const removeVideoUrl = (index: number) => {
    form.video_urls.splice(index, 1);
};

const submit = () => {
    form.post(route('episodes.update', props.episode.id), {
        forceFormData: true,
        onSuccess: () => toast.success('تم تحديث الحلقة بنجاح'),
        onError: () => toast.error('حدث خطأ أثناء تحديث الحلقة'),
    });
};
</script>

<template>
    <Head title="تعديل حلقة" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col flex-1 min-h-full gap-6 p-4 rounded-xl">
            <form @submit.prevent="submit" class="w-full max-w-4xl mx-auto space-y-6" enctype="multipart/form-data">

                <!-- اختيار المسلسل مع الصور -->
                <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                    <h2 class="text-xl font-semibold">المسلسل</h2>
                    <div class="relative">
                        <input type="text" v-model="searchQuery" @focus="dropdownOpen=true" placeholder="ابحث عن مسلسل..." class="w-full p-2 border rounded-md dark:bg-neutral-800 dark:text-white" />
                        <div v-if="dropdownOpen" class="absolute z-10 w-full mt-1 overflow-auto bg-white rounded-md shadow-md dark:bg-neutral-800 max-h-64">
                            <div v-for="anime in filteredAnimes" :key="anime.id"
                                 class="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700"
                                 @click="selectAnime(anime.id)">
                                <img v-if="anime.image" :src="`/storage/${anime.image}`" alt="cover" class="object-cover w-12 h-12 rounded-md" />
                                <span>{{ anime.title }}</span>
                            </div>
                            <div v-if="filteredAnimes.length === 0" class="p-2 text-gray-500">لا يوجد نتائج</div>
                        </div>
                        <InputError :message="form.errors.series_id" />
                    </div>
                </div>

                <!-- باقي الحقول تملأ تلقائياً عند اختيار المسلسل -->
                <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                    <div class="grid gap-4 md:grid-cols-2">
                        <div class="grid gap-2">
                            <Label for="title">العنوان (عربي)</Label>
                            <Input id="title" v-model="form.title" type="text" required />
                            <InputError :message="form.errors.title" />
                        </div>
                        <div class="grid gap-2">
                            <Label for="title_en">العنوان (إنجليزي)</Label>
                            <Input id="title_en" v-model="form.title_en" type="text" />
                            <InputError :message="form.errors.title_en" />
                        </div>
                        <div class="grid gap-2">
                            <Label for="episode_number">رقم الحلقة</Label>
                            <Input id="episode_number" v-model.number="form.episode_number" type="number" min="1" />
                            <InputError :message="form.errors.episode_number" />
                        </div>
                        <div class="grid gap-2 md:col-span-2">
                            <Label for="description">الوصف</Label>
                            <Textarea id="description" v-model="form.description" rows="4" />
                            <InputError :message="form.errors.description" />
                        </div>
                        <div class="grid gap-2 md:col-span-2">
                            <Label for="description_en">الوصف (إنجليزي)</Label>
                            <Textarea id="description_en" v-model="form.description_en" rows="4" />
                            <InputError :message="form.errors.description_en" />
                        </div>
                    </div>
                </div>

                <!-- روابط الفيديو -->
                <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                    <h2 class="text-xl font-semibold">الفيديو</h2>
                    <div v-for="(url, index) in form.video_urls" :key="index" class="flex items-center gap-2">
                        <Input v-model="form.video_urls[index]" type="url" placeholder="https://..." class="flex-1" />
                        <Button type="button" @click="removeVideoUrl(index)" class="text-white bg-red-500 hover:bg-red-600">حذف</Button>
                    </div>
                    <Button type="button" @click="addVideoUrl" class="mt-2 text-white bg-green-500 hover:bg-green-600">إضافة رابط جديد</Button>
                </div>

                <!-- الصور -->
                <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                    <h2 class="text-xl font-semibold">الصور</h2>
                    <div class="grid gap-4 md:grid-cols-2">
                        <div class="grid gap-2">
                            <Label for="thumbnail">Thumbnail</Label>
                            <Input id="thumbnail" type="file" accept="image/*" @change="handleFileChange($event, 'thumbnail')" />
                            <InputError :message="form.errors.thumbnail" />
                            <img v-if="thumbnailPreview" :src="thumbnailPreview" alt="thumbnail" class="object-cover w-32 h-32 rounded" />
                        </div>
                        <div class="grid gap-2">
                            <Label for="banner">Banner</Label>
                            <Input id="banner" type="file" accept="image/*" @change="handleFileChange($event, 'banner')" />
                            <InputError :message="form.errors.banner" />
                            <img v-if="bannerPreview" :src="bannerPreview" alt="banner" class="object-cover w-full h-32 rounded" />
                        </div>
                    </div>
                </div>

                <!-- معلومات إضافية -->
                <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                    <h2 class="text-xl font-semibold">معلومات إضافية</h2>
                    <div class="grid gap-4 md:grid-cols-2">
                        <div class="grid gap-2">
                            <Label for="release_date">تاريخ الإصدار</Label>
                            <Input id="release_date" v-model="form.release_date" type="date" />
                            <InputError :message="form.errors.release_date" />
                        </div>
                        <div class="grid gap-2">
                            <Label for="language">اللغة</Label>
                            <Input id="language" v-model="form.language" type="text" placeholder="ar" />
                            <InputError :message="form.errors.language" />
                        </div>
                        <div class="grid gap-2">
                            <Label for="rating">التقييم</Label>
                            <Input id="rating" v-model.number="form.rating" type="number" step="0.1" min="0" max="10" />
                            <InputError :message="form.errors.rating" />
                        </div>
                        <div class="flex items-center gap-2 pt-6">
                            <Checkbox id="is_published" v-model:checked="form.is_published" />
                            <Label for="is_published" class="cursor-pointer select-none">نشر الحلقة</Label>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-4">
                    <Button type="submit" :disabled="form.processing">
                        <LoaderCircle v-if="form.processing" class="w-4 h-4 mr-2 animate-spin" />
                        {{ form.processing ? 'جاري التحديث...' : 'تحديث' }}
                    </Button>
                </div>
            </form>
        </div>
    </AppLayout>
</template>
