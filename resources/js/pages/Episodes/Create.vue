<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { EpisodeForm, type BreadcrumbItem } from '@/types';
import { reactive, onMounted } from 'vue'
import { Head, useForm, usePage } from '@inertiajs/vue3'
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/InputError.vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'vue-sonner';
import { ref, watch, computed } from 'vue';
import { LoaderCircle } from 'lucide-vue-next';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Episodes', href: '/episodes' },
    { title: 'Create', href: '/episodes/create' },
];

const page = usePage<{ animes: Array<{ 
    id: number;
    title: string;
    title_en?: string;
    description?: string;
    description_en?: string;
    duration?: number;
    language?: string;
    rating?: number;
    slug?: string;
    slug_en?: string;
    image?: string;
    cover?: string;
} > }>();

const form = useForm<EpisodeForm>({
    series_id: 0,
    title: '',
    title_en: '',
    slug: '',
    slug_en: '',
    episode_number: 1,
    description: '',
    description_en: '',
    thumbnail: null,
    banner: null,
    video_urls: [''], // مصفوفة روابط الفيديو
    duration: undefined,
    quality: '',
    video_format: '',
    release_date: '',
    is_published: false,
    language: 'ar',
    subtitles: [],
    rating: 0,
});

const thumbnailPreview = ref<string | null>(null);
const bannerPreview = ref<string | null>(null);

const handleFileChange = (event: Event, field: 'thumbnail' | 'banner') => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    form[field] = file;

    const preview = file ? URL.createObjectURL(file) : null;
    if (field === 'thumbnail') thumbnailPreview.value = preview;
    else bannerPreview.value = preview;
};

const submit = () => {
    form.post(route('episodes.store'), {
        forceFormData: true,
        onSuccess: () => {
            toast.success('تم إنشاء الحلقة بنجاح');
            thumbnailPreview.value = null;
            bannerPreview.value = null;
            form.reset();
        },
        onError: () => toast.error('حدث خطأ أثناء إنشاء الحلقة'),
    });
};

// =======================
// ضبط تاريخ الإصدار تلقائيًا إذا كان فارغًا
// =======================
onMounted(() => {
    if (!form.release_date) {
        const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
        form.release_date = today;
    }
});

// =======================
// تعبئة الحقول تلقائيًا عند اختيار المسلسل
// =======================
watch(() => form.series_id, (newId) => {
    const selected = page.props.animes.find(a => a.id === newId);
    if (selected) {
        form.title = selected.title || '';
        form.title_en = selected.title_en || '';
        form.description = selected.description || '';
        form.description_en = selected.description_en || '';
        form.duration = selected.duration || undefined;
        form.language = selected.language || 'ar';
        form.rating = selected.rating || 0;
        form.slug = selected.slug || '';
        form.slug_en = selected.slug_en || '';

        if (!form.banner && selected.cover) bannerPreview.value = `/storage/${selected.cover}`;
        if (!form.thumbnail && selected.image) thumbnailPreview.value = `/storage/${selected.image}`;
    }
});

// =======================
// Dropdown مخصص مع بحث داخل select
// =======================
const dropdownOpen = ref(false);
const searchQuery = ref('');
const filteredAnimes = computed(() => {
    const q = searchQuery.value.toLowerCase();
    return page.props.animes.filter(
        anime => anime.title.toLowerCase().includes(q) || (anime.title_en && anime.title_en.toLowerCase().includes(q))
    );
});

const selectAnime = (animeId: number) => {
    form.series_id = animeId;
    dropdownOpen.value = false; // يغلق القائمة بعد الاختيار
};

// =======================
// إضافة وحذف روابط الفيديو
// =======================
const addVideoUrl = () => {
    form.video_urls.push('');
};
const removeVideoUrl = (index: number) => {
    form.video_urls.splice(index, 1);
};
</script>

<template>
<Head title="إضافة حلقة" />

<AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex flex-col flex-1 min-h-full gap-6 p-4 rounded-xl">
        <form @submit.prevent="submit" class="w-full max-w-4xl mx-auto space-y-6" enctype="multipart/form-data">

            <!-- معلومات أساسية -->
            <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                <h2 class="text-xl font-semibold">المعلومات الأساسية</h2>
                <div class="grid gap-4 md:grid-cols-2">

                    <!-- Dropdown مخصص مع البحث داخل select -->
                    <div class="relative grid gap-2 md:col-span-2">
                        <Label>المسلسل *</Label>
                        <div @click="dropdownOpen = !dropdownOpen" class="flex items-center justify-between w-full p-2 border rounded cursor-pointer">
                            <span>{{ page.props.animes.find(a => a.id === form.series_id)?.title || 'اختر مسلسل' }}</span>
                            <svg class="w-4 h-4 transition-transform" :class="{'rotate-180': dropdownOpen}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                        <input v-model="searchQuery" 
                            @focus="dropdownOpen = true" 
                            placeholder="ابحث عن مسلسل..." 
                            class="w-full p-2 mt-1 border rounded"
                        />
                        <div v-if="dropdownOpen" class="absolute z-50 w-full mt-1 overflow-auto bg-white border rounded-lg max-h-60 dark:bg-neutral-800 dark:border-neutral-700">
                            <div v-for="anime in filteredAnimes" :key="anime.id" @click="selectAnime(anime.id)" 
                                class="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700">
                                <img v-if="anime.image" :src="`/storage/${anime.image}`" alt="thumb" class="object-cover w-10 h-10 rounded" />
                                <span>{{ anime.title }}</span>
                            </div>
                            <div v-if="filteredAnimes.length === 0" class="p-2 text-gray-500">لا يوجد نتائج</div>
                        </div>
                        <InputError :message="form.errors.series_id" />
                    </div>

                    <div class="grid gap-2">
                        <Label for="title">العنوان (عربي) *</Label>
                        <Input id="title" v-model="form.title" type="text" required />
                        <InputError :message="form.errors.title" />
                    </div>
                    <div class="grid gap-2">
                        <Label for="title_en">العنوان (إنجليزي)</Label>
                        <Input id="title_en" v-model="form.title_en" type="text" />
                        <InputError :message="form.errors.title_en" />
                    </div>
                    <div class="grid gap-2">
                        <Label for="episode_number">رقم الحلقة *</Label>
                        <Input id="episode_number" v-model.number="form.episode_number" type="number" min="1" required />
                        <InputError :message="form.errors.episode_number" />
                    </div>
                    <div class="grid gap-2">
                        <Label for="slug">Slug</Label>
                        <Input id="slug" v-model="form.slug" type="text" />
                        <InputError :message="form.errors.slug" />
                    </div>
                    <div class="grid gap-2">
                        <Label for="slug_en">Slug (English)</Label>
                        <Input id="slug_en" v-model="form.slug_en" type="text" />
                        <InputError :message="form.errors.slug_en" />
                    </div>
                    <div class="grid gap-2 md:col-span-2">
                        <Label for="description">الوصف (عربي)</Label>
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

            <!-- الفيديو -->
            <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                <h2 class="text-xl font-semibold">الفيديو</h2>
                <div class="space-y-2">
                    <template v-for="(url, index) in form.video_urls" :key="index">
                        <div class="flex items-center gap-2">
                            <Input v-model="form.video_urls[index]" type="url" placeholder="https://..." class="flex-1" />
                            <Button type="button" @click="removeVideoUrl(index)" class="text-white bg-red-500">حذف</Button>
                        </div>
                    </template>
                    <Button type="button" @click="addVideoUrl">إضافة رابط فيديو آخر</Button>
                </div>

                <div class="grid gap-4 mt-4 md:grid-cols-2">
                    <div class="grid gap-2">
                        <Label for="duration">المدة (بالدقائق)</Label>
                        <Input id="duration" v-model.number="form.duration" type="number" min="1" />
                        <InputError :message="form.errors.duration" />
                    </div>

                 <div class="grid gap-2">
    <Label for="quality">الجودة</Label>
    <select id="quality" v-model="form.quality" class="border rounded px-2 py-1">
        <option value="">اختر الجودة</option>
        <option value="4K">4K</option>
        <option value="1080p">1080p</option>
        <option value="720p">720p</option>
        <option value="480p">480p</option>
    </select>
    <InputError :message="form.errors.quality" />
</div>


                  <div class="grid gap-2">
    <Label for="video_format">صيغة الفيديو</Label>
    <select id="video_format" v-model="form.video_format" class="border rounded px-2 py-1">
        <option value="">اختر صيغة الفيديو</option>
        <option value="mp4">MP4</option>
        <option value="mkv">MKV</option>
        <option value="webm">WEBM</option>
        <option value="avi">AVI</option>
        <option value="bluray">BluRay</option>
    </select>
    <InputError :message="form.errors.video_format" />
</div>

                </div>
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

            <!-- زر الحفظ -->
            <div class="flex justify-end gap-4">
                <Button type="submit" :disabled="form.processing">
                    <LoaderCircle v-if="form.processing" class="w-4 h-4 mr-2 animate-spin" />
                    {{ form.processing ? 'جاري الحفظ...' : 'حفظ' }}
                </Button>
            </div>

        </form>
    </div>
</AppLayout>
</template>
