<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/InputError.vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem, Category } from '@/types';
import { toast } from 'vue-sonner';
import { computed, ref } from 'vue';

// ✅ استقبال الأنواع واللغات والسيزون والاستوديو
const props = defineProps<{
    categories: Category[];
    seasons: { id: number; name: string }[];
    languages: { id: number; name: string }[];
    types: { id: number; name: string }[];
    studios: { id: number; name: string }[];
}>();

interface AnimeFormData {
    title: string;
    title_en: string;
    slug: string;
    slug_en: string;
    description: string;
    description_en: string;
    season_id: number | null;
    status: string;
    release_date: string;
    rating: string;
    image: File | null;
    cover: File | null;
    studio_id: number | null; // ⬅️ تم التغيير هنا
    duration: string;
    language_id: number | null;
    type_id: number | null;
    trailer: string;
    is_active: boolean;
    category_ids: number[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Animes', href: '/animes' },
    { title: 'Create', href: '/animes/create' },
];

const form = useForm<AnimeFormData>({
    title: '',
    title_en: '',
    slug: '',
    slug_en: '',
    description: '',
    description_en: '',
    season_id: null,
    status: '',
    release_date: '',
    rating: '',
    image: null,
    cover: null,
    studio_id: null,
    duration: '',
    language_id: null,
    type_id: null,
    trailer: '',
    is_active: true,
    category_ids: [],
});

const imagePreview = ref<string | null>(null);
const coverPreview = ref<string | null>(null);

const coverStyle = computed(() => {
    if (!coverPreview.value)
        return { background: 'linear-gradient(135deg, rgba(79,70,229,0.8), rgba(147,51,234,0.8))' } as const;
    return {
        backgroundImage: `linear-gradient(135deg, rgba(17,24,39,0.65), rgba(17,24,39,0.1)), url(${coverPreview.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    } as const;
});

const handleFileChange = (event: Event, field: 'image' | 'cover') => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    form[field] = file;
    const preview = file ? URL.createObjectURL(file) : null;
    if (field === 'image') imagePreview.value = preview;
    else coverPreview.value = preview;
};

const toggleCategory = (categoryId: number) => {
    const index = form.category_ids.indexOf(categoryId);
    if (index > -1) form.category_ids.splice(index, 1);
    else form.category_ids.push(categoryId);
};

const submit = () => {
    form.transform((data) => {
        const transformed: any = {
            title: data.title || '',
            title_en: data.title_en || null,
            slug: data.slug || '',
            slug_en: data.slug_en || null,
            description: data.description || null,
            description_en: data.description_en || null,
            season_id: data.season_id ? Number(data.season_id) : null,
            status: data.status || null,
            release_date: data.release_date || null,
            rating: data.rating ? Number(data.rating) : null,
            duration: data.duration ? Number(data.duration) : null,
            studio_id: data.studio_id ? Number(data.studio_id) : null,
            language_id: data.language_id ? Number(data.language_id) : null,
            type_id: data.type_id ? Number(data.type_id) : null,
            trailer: data.trailer || null,
            is_active: data.is_active ? 1 : 0,
            image: data.image,
            cover: data.cover,
            category_ids: data.category_ids,
        };
        return transformed;
    }).post(route('animes.store'), {
        forceFormData: true,
        onSuccess: () => {
            toast.success('تم إنشاء الأنمي بنجاح');
            imagePreview.value = null;
            coverPreview.value = null;
            form.reset();
        },
        onError: (errors) => {
            console.error('Validation Errors:', errors);
            toast.error('حدث خطأ أثناء إنشاء الأنمي. راجع الحقول.');
        },
    });
};
</script>

<template>
    <Head title="إضافة أنمي" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <form @submit.prevent="submit" class="flex flex-col flex-1 min-h-full gap-6 p-4 rounded-xl" enctype="multipart/form-data">

            <!-- Cover & Poster -->
            <div class="relative w-full">
                <div class="h-48 border rounded-3xl md:h-60 lg:h-72 border-sidebar-border/60" :style="coverStyle"></div>
                <div class="max-w-5xl px-4 mx-auto -mt-16 md:-mt-20">
                    <div class="flex flex-col gap-6 md:flex-row md:items-end">
                        <div class="relative flex-shrink-0 overflow-hidden border shadow-xl w-36 h-52 rounded-2xl md:w-44 md:h-64 border-sidebar-border/50">
                            <img v-if="imagePreview" :src="imagePreview" alt="Anime poster" class="object-cover w-full h-full">
                            <div v-else class="flex items-center justify-center w-full h-full text-sm text-white bg-indigo-500">
                                أضف صورة البوستر
                            </div>
                        </div>
                        <div class="flex-1 p-6 space-y-6 bg-white shadow-xl dark:bg-neutral-900/90 rounded-3xl">
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

                            <div class="grid gap-2 md:col-span-2">
                                <Label for="description">Description (عربي)</Label>
                                <Textarea id="description" v-model="form.description" rows="4" placeholder="ملخص عن الأنمي"/>
                                <InputError :message="form.errors.description" />
                            </div>
                            <div class="grid gap-2 md:col-span-2">
                                <Label for="description_en">Description (English)</Label>
                                <Textarea id="description_en" v-model="form.description_en" rows="4" placeholder="Anime summary"/>
                                <InputError :message="form.errors.description_en" />
                            </div>

                            <div class="flex items-center gap-2">
                                <Checkbox id="is_active" v-model:checked="form.is_active" />
                                <Label for="is_active" class="cursor-pointer select-none">Active</Label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form Details -->
            <div class="w-full max-w-5xl px-4 mx-auto">
                <div class="grid gap-6 lg:grid-cols-[2fr,1fr]">

                    <div class="space-y-6">
                        <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                            <h2 class="text-xl font-semibold">معلومات عامة</h2>
                            <div class="grid gap-4 sm:grid-cols-2">
                                <div class="grid gap-2">
                                    <Label for="status">Status</Label>
                                    <Input id="status" v-model="form.status" type="text" placeholder="Ongoing"/>
                                    <InputError :message="form.errors.status"/>
                                </div>

                                <div class="grid gap-2">
                                    <Label for="season_id">Season</Label>
                                    <select id="season_id" v-model="form.season_id" class="p-2 border rounded-md border-gray-300 dark:border-neutral-700 dark:bg-neutral-900 text-black dark:text-white">
                                        <option value="">اختر السيزون</option>
                                        <option v-for="season in props.seasons" :key="season.id" :value="season.id">
                                            {{ season.name }}
                                        </option>
                                    </select>
                                    <InputError :message="form.errors.season_id" />
                                </div>

                                <div class="grid gap-2">
                                    <Label for="release_date">Release Date</Label>
                                    <Input id="release_date" v-model="form.release_date" type="date"/>
                                    <InputError :message="form.errors.release_date"/>
                                </div>

                                <div class="grid gap-2">
                                    <Label for="rating">Rating</Label>
                                    <Input id="rating" v-model="form.rating" type="number" step="0.1" min="0" max="10"/>
                                    <InputError :message="form.errors.rating"/>
                                </div>

                                <div class="grid gap-2">
                                    <Label for="type_id">Type</Label>
                                    <select id="type_id" v-model="form.type_id" class="p-2 border rounded-md border-gray-300 dark:border-neutral-700 dark:bg-neutral-900 text-black dark:text-white">
                                        <option value="">اختر النوع</option>
                                        <option v-for="type in props.types" :key="type.id" :value="type.id">
                                            {{ type.name_en  }}
                                        </option>
                                    </select>
                                    <InputError :message="form.errors.type_id" />
                                </div>

                                <div class="grid gap-2">
                                    <Label for="duration">Duration (mins)</Label>
                                    <Input id="duration" v-model="form.duration" type="number" min="0"/>
                                    <InputError :message="form.errors.duration"/>
                                </div>

                                <div class="grid gap-2 sm:col-span-2">
                                    <Label for="language_id">Language</Label>
                                    <select id="language_id" v-model="form.language_id" class="p-2 border rounded-md border-gray-300 dark:border-neutral-700 dark:bg-neutral-900 text-black dark:text-white">
                                        <option value="">اختر اللغة</option>
                                        <option v-for="lang in props.languages" :key="lang.id" :value="lang.id">
                                            {{ lang.name_en }}
                                        </option>
                                    </select>
                                    <InputError :message="form.errors.language_id" />
                                </div>

                                <!-- Studio -->
                                <div class="grid gap-2 sm:col-span-2">
                                    <Label for="studio_id">Studio</Label>
                                    <select id="studio_id" v-model="form.studio_id" class="p-2 border rounded-md border-gray-300 dark:border-neutral-700 dark:bg-neutral-900 text-black dark:text-white">
                                        <option value="">اختر الاستوديو</option>
                                        <option v-for="studio in props.studios" :key="studio.id" :value="studio.id">
                                            {{ studio.name_en }}
                                        </option>
                                    </select>
                                    <InputError :message="form.errors.studio_id" />
                                </div>
                            </div>
                        </div>

                        <!-- Links -->
                        <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                            <h2 class="text-xl font-semibold">الروابط</h2>
                            <div class="grid gap-4">
                                <div class="grid gap-2">
                                    <Label for="trailer">Trailer URL</Label>
                                    <Input id="trailer" v-model="form.trailer" type="url" placeholder="https://youtube.com/..."/>
                                    <InputError :message="form.errors.trailer"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- الصور والتصنيفات والإجراءات -->
                    <div class="space-y-6">
                        <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                            <h2 class="text-xl font-semibold">الصور</h2>
                            <div class="space-y-4">
                                <div class="grid gap-2">
                                    <Label for="image">Poster Image</Label>
                                    <Input id="image" type="file" accept="image/*" @change="(event) => handleFileChange(event, 'image')"/>
                                    <InputError :message="form.errors.image"/>
                                </div>
                                <div v-if="imagePreview" class="overflow-hidden border rounded-2xl border-sidebar-border/60">
                                    <img :src="imagePreview" alt="Poster preview" class="object-cover w-full h-48"/>
                                </div>

                                <div class="grid gap-2">
                                    <Label for="cover">Cover Image</Label>
                                    <Input id="cover" type="file" accept="image/*" @change="(event) => handleFileChange(event, 'cover')"/>
                                    <InputError :message="form.errors.cover"/>
                                </div>
                                <div v-if="coverPreview" class="overflow-hidden border rounded-2xl border-sidebar-border/60">
                                    <img :src="coverPreview" alt="Cover preview" class="object-cover w-full h-32 md:h-40"/>
                                </div>
                            </div>
                        </div>

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
                                    <Label :for="`category_${category.id}`" class="text-sm font-medium cursor-pointer select-none">
                                        {{ category.name }} </Label>
                                </div>
                            </div>
                            <InputError :message="form.errors.category_ids" />
                            <InputError :message="form.errors['category_ids.*']" />
                        </div>

                        <div class="p-6 space-y-4 bg-white shadow-lg dark:bg-neutral-900/80 rounded-3xl">
                            <h2 class="text-xl font-semibold">إجراءات</h2>
                            <p class="text-sm text-muted-foreground">أكمل الحقول المطلوبة ثم اضغط على زر الإنشاء لإضافة الأنمي.</p>
                            <Button type="submit" class="w-full" :disabled="form.processing">إنشاء الأنمي</Button>
                        </div>
                    </div>

                </div>
            </div>

        </form>
    </AppLayout>
</template>
