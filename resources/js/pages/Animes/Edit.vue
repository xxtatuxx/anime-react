<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/InputError.vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem, Category, Studio, Type, Language, Season } from '@/types';
import { toast } from 'vue-sonner';
import { computed, ref } from 'vue';

/*
|--------------------------------------------------------------------------
| 1. تعريف واجهة البيانات (AnimeFormData)
|--------------------------------------------------------------------------
*/
interface AnimeFormData {
    title: string;
    title_en: string;
    slug: string;
    slug_en: string;
    description: string | null;
    description_en: string | null;
    seasons: string;
    status: string | null;
    release_date: string | null;
    rating: string;
    image: File | null;
    cover: File | null;
    studio_name: string | null;
    duration: string;
    language: string | null;
    trailer: string | null;
    type: string | null;
    is_active: boolean;
    category_ids: number[];
}

/*
|--------------------------------------------------------------------------
| 2. Props
|--------------------------------------------------------------------------
*/
const props = defineProps<{
    anime: Record<string, any>;
    categories: Category[];
    studios: Studio[];
    types: Type[];
    languages: Language[];
    seasons: Season[];
}>();

/*
|--------------------------------------------------------------------------
| 3. Breadcrumbs
|--------------------------------------------------------------------------
*/
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Animes', href: '/animes' },
    { title: props.anime.title ?? 'Edit', href: `/animes/${props.anime.id}/edit` },
];

/*
|--------------------------------------------------------------------------
| 4. معالجات الصور
|--------------------------------------------------------------------------
*/
const coverUrl = computed(() => props.anime.cover ? `/storage/${props.anime.cover}` : null);
const imageUrl = computed(() => props.anime.image ? `/storage/${props.anime.image}` : null);

const imagePreview = ref<string | null>(imageUrl.value);
const coverPreview = ref<string | null>(coverUrl.value);

const coverStyle = computed(() => {
    const source = coverPreview.value;
    if (!source) {
        return { background: 'linear-gradient(135deg, rgba(79,70,229,0.8), rgba(147,51,234,0.8))' } as const;
    }
    return {
        backgroundImage: `linear-gradient(135deg, rgba(17,24,39,0.65), rgba(17,24,39,0.1)), url(${source})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    } as const;
});

/*
|--------------------------------------------------------------------------
| 5. تعريف النموذج (Form)
|--------------------------------------------------------------------------
*/
const form = useForm<AnimeFormData>({
    title: props.anime.title ?? '',
    title_en: props.anime.title_en ?? '',
    slug: props.anime.slug ?? '',
    slug_en: props.anime.slug_en ?? '',
    description: props.anime.description ?? '',
    description_en: props.anime.description_en ?? '',
    seasons: props.anime.seasons ? String(props.anime.seasons) : '',
    status: props.anime.status ?? '',
    release_date: props.anime.release_date ?? '',
    rating: props.anime.rating ? String(props.anime.rating) : '',
    image: null,
    cover: null,
    studio_name: props.anime.studio_name ?? '',
    duration: props.anime.duration ? String(props.anime.duration) : '',
    language: props.anime.language ?? '',
    trailer: props.anime.trailer ?? '',
    type: props.anime.type ?? '',
    is_active: Boolean(props.anime.is_active),
    category_ids: props.anime.categories?.map((cat: any) => cat.id) ?? [],
});

/*
|--------------------------------------------------------------------------
| 6. دالة تغيير الملف
|--------------------------------------------------------------------------
*/
const handleFileChange = (event: Event, field: 'image' | 'cover') => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    form[field] = file;

    const preview = file ? URL.createObjectURL(file) : (field === 'image' ? imageUrl.value : coverUrl.value);
    if (field === 'image') imagePreview.value = preview;
    else coverPreview.value = preview;
};

/*
|--------------------------------------------------------------------------
| 7. دالة تبديل التصنيفات
|--------------------------------------------------------------------------
*/
const toggleCategory = (categoryId: number) => {
    const index = form.category_ids.indexOf(categoryId);
    if (index > -1) form.category_ids.splice(index, 1);
    else form.category_ids.push(categoryId);
};

/*
|--------------------------------------------------------------------------
| 8. دالة الإرسال
|--------------------------------------------------------------------------
*/
const submit = () => {
    form.transform((data) => ({
        _method: 'put',
        title: data.title || '',
        title_en: data.title_en || null,
        slug: data.slug || '',
        slug_en: data.slug_en || null,
        description: data.description || null,
        description_en: data.description_en || null,
        seasons: data.seasons ? Number(data.seasons) : null,
        status: data.status || null,
        release_date: data.release_date || null,
        rating: data.rating ? Number(data.rating) : null,
        duration: data.duration ? Number(data.duration) : null,
        studio_name: data.studio_name || null,
        language: data.language || null,
        trailer: data.trailer || null,
        type: data.type || null,
        is_active: data.is_active ? 1 : 0,
        image: data.image,
        cover: data.cover,
        category_ids: data.category_ids,
    })).post(route('animes.update', props.anime.id), {
        forceFormData: true,
        onSuccess: () => {
            toast.success('تم تحديث الأنمي بنجاح');
            if (form.image && typeof form.image !== 'string') imagePreview.value = URL.createObjectURL(form.image);
            if (form.cover && typeof form.cover !== 'string') coverPreview.value = URL.createObjectURL(form.cover);
        },
        onError: (errors) => {
            console.error("Update Errors:", errors);
            toast.error('حدث خطأ أثناء تحديث الأنمي. راجع الحقول.');
        },
    });
};
</script>

<template>
    <Head title="تعديل الأنمي" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <form @submit.prevent="submit" class="flex flex-col flex-1 min-h-full gap-6 p-4 rounded-xl" enctype="multipart/form-data">
            
            <!-- Cover Image -->
            <div class="relative w-full">
                <div class="h-48 border rounded-3xl md:h-60 lg:h-72 border-sidebar-border/60" :style="coverStyle"></div>

                <!-- Poster Image and Main Info -->
                <div class="max-w-5xl px-4 mx-auto -mt-16 md:-mt-20">
                    <div class="flex flex-col gap-6 md:flex-row md:items-end">
                        <div class="relative flex-shrink-0 overflow-hidden border shadow-xl w-36 h-52 rounded-2xl md:w-44 md:h-64 border-sidebar-border/50">
                            <img v-if="imagePreview" :src="imagePreview" alt="Anime poster" class="object-cover w-full h-full">
                            <div v-else class="flex items-center justify-center w-full h-full text-sm text-white bg-indigo-500">لا توجد صورة</div>
                        </div>

                        <!-- Main Form -->
                        <div class="flex-1 p-6 space-y-6 bg-white shadow-xl dark:bg-neutral-900/90 rounded-3xl">

                            <!-- Title Fields -->
                            <div class="grid gap-4 md:grid-cols-2">
                                <div class="grid gap-2">
                                    <Label for="title">Title (عربي) *</Label>
                                    <Input id="title" v-model="form.title" type="text" placeholder="Attack on Titan" />
                                    <InputError :message="form.errors.title" />
                                </div>
                                <div class="grid gap-2">
                                    <Label for="title_en">Title (English)</Label>
                                    <Input id="title_en" v-model="form.title_en" type="text" placeholder="Attack on Titan" />
                                    <InputError :message="form.errors.title_en" />
                                </div>
                            </div>

                            <!-- Slug Fields -->
                            <div class="grid gap-4 md:grid-cols-2">
                                <div class="grid gap-2">
                                    <Label for="slug">Slug (عربي) *</Label>
                                    <Input id="slug" v-model="form.slug" type="text" placeholder="attack-on-titan" />
                                    <InputError :message="form.errors.slug" />
                                </div>
                                <div class="grid gap-2">
                                    <Label for="slug_en">Slug (English)</Label>
                                    <Input id="slug_en" v-model="form.slug_en" type="text" placeholder="attack-on-titan" />
                                    <InputError :message="form.errors.slug_en" />
                                </div>
                            </div>

                            <!-- Description Fields -->
                            <div class="grid gap-2 md:col-span-2">
                                <Label for="description">Description (عربي)</Label>
                                <Textarea id="description" v-model="form.description" rows="4" placeholder="ملخص عن الأنمي" />
                                <InputError :message="form.errors.description" />
                            </div>
                            <div class="grid gap-2 md:col-span-2">
                                <Label for="description_en">Description (English)</Label>
                                <Textarea id="description_en" v-model="form.description_en" rows="4" placeholder="Anime summary" />
                                <InputError :message="form.errors.description_en" />
                            </div>

                            <!-- Active Checkbox -->
                            <div class="flex flex-wrap items-center gap-3">
                                <div class="flex items-center gap-2">
                                    <Checkbox id="is_active" v-model:checked="form.is_active" />
                                    <Label for="is_active" class="cursor-pointer select-none">Active</Label>
                                </div>
                                <span class="text-xs text-muted-foreground">آخر تحديث بواسطة {{ props.anime.user?.name ?? 'غير معروف' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- General Info, Studio, Links, Images, Categories, Submit -->
            <div class="w-full max-w-5xl px-4 mx-auto">
                <div class="grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <div class="space-y-6">

                        <!-- General Info -->
                        <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                            <h2 class="text-xl font-semibold">معلومات عامة</h2>
                            <div class="grid gap-4 sm:grid-cols-2">
                                <div class="grid gap-2">
                                    <Label for="status">Status</Label>
                                    <Input id="status" v-model="form.status" type="text" placeholder="Ongoing" />
                                    <InputError :message="form.errors.status" />
                                </div>

                                <div class="grid gap-2">
                                    <Label for="seasons">Seasons</Label>
                                    <select id="seasons" v-model="form.seasons" class="select-class">
                                        <option value="">اختر الموسم</option>
                                        <option v-for="s in props.seasons" :key="s.id" :value="String(s.id)">{{ s.name }}</option>
                                    </select>
                                    <InputError :message="form.errors.seasons" />
                                </div>

                                <div class="grid gap-2">
                                    <Label for="rating">Rating</Label>
                                    <Input id="rating" v-model="form.rating" type="number" step="0.1" min="0" max="10" />
                                    <InputError :message="form.errors.rating" />
                                </div>

                            <div class="grid gap-2">
    <Label for="type">Type</Label>
    <select id="type" v-model="form.type" class="select-class">
        <option value="">اختر النوع</option>
        <option v-for="t in props.types" :key="t.id" :value="t.name_en">{{ t.name_en }}</option>
    </select>
    <InputError :message="form.errors.type" />
</div>


                                <div class="grid gap-2">
                                    <Label for="duration">Duration (mins)</Label>
                                    <Input id="duration" v-model="form.duration" type="number" min="0" />
                                    <InputError :message="form.errors.duration" />
                                </div>

                                <div class="grid gap-2">
                                    <Label for="language">Language</Label>
                                    <select id="language" v-model="form.language" class="select-class">
                                        <option value="">اختر اللغة</option>
                                        <option v-for="l in props.languages" :key="l.id" :value="l.name_en">{{ l.name_en }}</option>
                                    </select>
                                    <InputError :message="form.errors.language" />
                                </div>
                            </div>
                        </div>

                        <!-- Studio Info -->
                        <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                            <h2 class="text-xl font-semibold">الاستوديو</h2>
                            <div class="grid gap-4">
                                <div class="grid gap-2">
                                    <Label for="studio_name">Studio Name</Label>
                                    <select id="studio_name" v-model="form.studio_name" class="select-class">
                                        <option value="">اختر الاستوديو</option>
                                        <option v-for="s in props.studios" :key="s.id" :value="s.name_en">{{ s.name_en }}</option>
                                    </select>
                                    <InputError :message="form.errors.studio_name" />
                                </div>
                            </div>
                        </div>

                        <!-- Trailer -->
                        <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                            <h2 class="text-xl font-semibold">الروابط</h2>
                            <div class="grid gap-4">
                                <div class="grid gap-2">
                                    <Label for="trailer">Trailer URL</Label>
                                    <Input id="trailer" v-model="form.trailer" type="url" placeholder="https://youtube.com/..." />
                                    <InputError :message="form.errors.trailer" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Images & Categories & Submit -->
                    <div class="space-y-6">

                        <!-- Images -->
                        <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                            <h2 class="text-xl font-semibold">الصور</h2>
                            <div class="space-y-4">
                                <div class="grid gap-2">
                                    <Label for="image">Poster Image</Label>
                                    <Input id="image" type="file" accept="image/*" @change="(event) => handleFileChange(event, 'image')" />
                                    <InputError :message="form.errors.image" />
                                </div>
                                <div v-if="imagePreview" class="overflow-hidden transition-all border rounded-2xl border-sidebar-border/60">
                                    <img :src="imagePreview" alt="Poster preview" class="object-cover w-full h-48">
                                </div>
                                <div class="grid gap-2">
                                    <Label for="cover">Cover Image</Label>
                                    <Input id="cover" type="file" accept="image/*" @change="(event) => handleFileChange(event, 'cover')" />
                                    <InputError :message="form.errors.cover" />
                                </div>
                                <div v-if="coverPreview" class="overflow-hidden transition-all border rounded-2xl border-sidebar-border/60">
                                    <img :src="coverPreview" alt="Cover preview" class="object-cover w-full h-32 md:h-40">
                                </div>
                            </div>
                        </div>

                        <!-- Categories -->
                        <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                            <h2 class="text-xl font-semibold">التصنيفات</h2>
                            <div class="grid grid-cols-2 gap-3 pr-2 overflow-y-auto max-h-60">
                                <div v-if="!props.categories || props.categories.length === 0">
                                    <p class="col-span-2 text-sm text-muted-foreground">لا توجد تصنيفات معرفة.</p>
                                </div>
                                <div v-for="category in props.categories" :key="category.id" class="flex items-center gap-2">
                                    <Checkbox
                                        :id="`category_${category.id}`"
                                        :checked="form.category_ids.includes(category.id)"
                                        @update:checked="() => toggleCategory(category.id)"
                                    />
                                    <Label :for="`category_${category.id}`" class="text-sm font-medium cursor-pointer select-none">{{ category.name }}</Label>
                                </div>
                            </div>
                            <InputError :message="form.errors.category_ids" />
                            <InputError :message="form.errors['category_ids.*']" />
                        </div>

                        <!-- Submit -->
                        <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                            <Button type="submit" class="w-full py-3 text-white bg-indigo-600 hover:bg-indigo-700">
                                تحديث الأنمي
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </AppLayout>
</template>

<style scoped>
/* جميع select مع وضع ليلي ونهاري */
.select-class {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid #d1d5db; /* Light gray */
    background-color: white;
    color: black;
    transition: all 0.2s ease-in-out;
}

.dark .select-class {
    background-color: #1f2937; /* Dark background */
    color: white;
    border-color: #374151; /* Dark border */
}

.select-class:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99,102,241,0.3);
}
</style>
