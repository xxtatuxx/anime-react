<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { Head, useForm, router } from '@inertiajs/vue3';
import { LoaderCircle } from 'lucide-vue-next';
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/InputError.vue';
import { ref } from 'vue';

interface BreadcrumbItem {
  title: string;
  href: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Add News', href: '/news' },
];

// ✨ إعداد البيانات
const form = useForm({
    title_ar: '',
    subtitle_ar: '',
    description_ar: '',
    link_ar: '',
    title_en: '',
    subtitle_en: '',
    description_en: '',
    link: '',
    image: null as File | null,
});

const imagePreview = ref<string | null>(null);

// ✨ عند اختيار الصورة
const handleImageInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files ? target.files[0] : null;

    form.image = file;
    imagePreview.value = file ? URL.createObjectURL(file) : null;
};

// ✨ الإرسال إلى Laravel
const submit = () => {
    const data = new FormData();
    data.append('title_ar', form.title_ar);
    data.append('subtitle_ar', form.subtitle_ar || '');
    data.append('description_ar', form.description_ar || '');
    data.append('link_ar', form.link_ar || '');
    data.append('title_en', form.title_en);
    data.append('subtitle_en', form.subtitle_en || '');
    data.append('description_en', form.description_en || '');
    data.append('link', form.link || '');
    if (form.image) data.append('image', form.image);

    router.post(route('news.store'), data, {
        forceFormData: true, // مهم جدًا لإرسال الملفات
        onFinish: () => {
            imagePreview.value = null;
            form.reset('image');
        },
    });
};
</script>

<template>
    <Head title="Create News" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">
            <div class="p-6 mx-auto mt-8 bg-white shadow-lg min-w-md dark:bg-neutral-800 rounded-xl">
                <form @submit.prevent="submit" class="flex flex-col gap-6">
                    <div class="grid gap-6">

                        <!-- العنوان العربي -->
                        <div class="grid gap-2">
                            <Label for="title_ar">Title (AR)</Label>
                            <Input
                                id="title_ar"
                                type="text"
                                autofocus
                                v-model="form.title_ar"
                                placeholder="عنوان الخبر بالعربية"
                            />
                            <InputError :message="form.errors.title_ar" />
                        </div>

                        <!-- العنوان الإنجليزي -->
                        <div class="grid gap-2">
                            <Label for="title_en">Title (EN)</Label>
                            <Input
                                id="title_en"
                                type="text"
                                v-model="form.title_en"
                                placeholder="News title in English"
                            />
                            <InputError :message="form.errors.title_en" />
                        </div>

                        <!-- الوصف العربي -->
                        <div class="grid gap-2">
                            <Label for="description_ar">Description (AR)</Label>
                            <Textarea
                                id="description_ar"
                                v-model="form.description_ar"
                                placeholder="وصف الخبر بالعربية"
                            />
                            <InputError :message="form.errors.description_ar" />
                        </div>

                        <!-- الوصف الإنجليزي -->
                        <div class="grid gap-2">
                            <Label for="description_en">Description (EN)</Label>
                            <Textarea
                                id="description_en"
                                v-model="form.description_en"
                                placeholder="News description in English"
                            />
                            <InputError :message="form.errors.description_en" />
                        </div>

                        <!-- الرابط العربي -->
                        <div class="grid gap-2">
                            <Label for="link_ar">Link (AR)</Label>
                            <Input
                                id="link_ar"
                                type="url"
                                v-model="form.link_ar"
                                placeholder="الرابط بالعربية"
                            />
                            <InputError :message="form.errors.link_ar" />
                        </div>

                        <!-- الرابط الإنجليزي -->
                        <div class="grid gap-2">
                            <Label for="link">Link (EN)</Label>
                            <Input
                                id="link"
                                type="url"
                                v-model="form.link"
                                placeholder="Link in English"
                            />
                            <InputError :message="form.errors.link" />
                        </div>

                        <!-- رفع الصورة -->
                        <div class="grid gap-2">
                            <Label for="image">Image</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                @change="handleImageInput"
                            />
                            <div v-if="imagePreview" class="mt-2">
                                <img :src="imagePreview" alt="preview" class="object-cover w-32 h-32 border border-gray-300 rounded" />
                            </div>
                            <InputError :message="form.errors.image" />
                        </div>

                        <!-- زر الإرسال -->
                        <Button type="submit" class="w-full mt-4" :disabled="form.processing">
                            <LoaderCircle v-if="form.processing" class="w-4 h-4 animate-spin" />
                            Create News
                        </Button>

                    </div>
                </form>
            </div>
        </div>
    </AppLayout>
</template>
