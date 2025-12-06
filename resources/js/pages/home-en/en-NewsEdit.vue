<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
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
    { title: 'Edit News', href: '/news' },
];

// استلام الـ props للخبر الحالي
const { currentNews } = defineProps<{
    currentNews: any;
}>();

// نموذج التعديل
const form = useForm({
    title_ar: currentNews.title_ar,
    subtitle_ar: currentNews.subtitle_ar,
    description_ar: currentNews.description_ar,
    link_ar: currentNews.link_ar,
    title_en: currentNews.title_en,
    subtitle_en: currentNews.subtitle_en,
    description_en: currentNews.description_en,
    link: currentNews.link,
    image: null,
    _method: 'put',
});

const imagePreview = ref<string | null>(null);

// اختيار الصورة الجديدة
const handleImageInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        form.image = file;
        imagePreview.value = URL.createObjectURL(file);
    }
};

// الإرسال
const submit = () => {
    form.post(route('news.update', currentNews.id), {
        forceFormData: true,
    });
};
</script>

<template>
    <Head title="Edit News" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col flex-1 h-full gap-4 p-4">
            <div class="p-6 mx-auto mt-8 bg-white shadow-lg min-w-md dark:bg-neutral-800 rounded-xl">
                <form @submit.prevent="submit" class="flex flex-col gap-6">
                    <div class="grid gap-6">
                        <!-- العنوان العربي -->
                        <div class="grid gap-2">
                            <Label for="title_ar">Title (AR)</Label>
                            <Input id="title_ar" v-model="form.title_ar" placeholder="عنوان الخبر بالعربية" />
                            <InputError :message="form.errors.title_ar" />
                        </div>

                        <!-- العنوان الإنجليزي -->
                        <div class="grid gap-2">
                            <Label for="title_en">Title (EN)</Label>
                            <Input id="title_en" v-model="form.title_en" placeholder="News title in English" />
                            <InputError :message="form.errors.title_en" />
                        </div>

                        <!-- الوصف العربي -->
                        <div class="grid gap-2">
                            <Label for="description_ar">Description (AR)</Label>
                            <Textarea id="description_ar" v-model="form.description_ar" placeholder="وصف الخبر بالعربية" />
                            <InputError :message="form.errors.description_ar" />
                        </div>

                        <!-- الوصف الإنجليزي -->
                        <div class="grid gap-2">
                            <Label for="description_en">Description (EN)</Label>
                            <Textarea id="description_en" v-model="form.description_en" placeholder="News description in English" />
                            <InputError :message="form.errors.description_en" />
                        </div>

                        <!-- الرابط العربي -->
                        <div class="grid gap-2">
                            <Label for="link_ar">Link (AR)</Label>
                            <Input id="link_ar" v-model="form.link_ar" placeholder="الرابط بالعربية" />
                            <InputError :message="form.errors.link_ar" />
                        </div>

                        <!-- الرابط الإنجليزي -->
                        <div class="grid gap-2">
                            <Label for="link">Link (EN)</Label>
                            <Input id="link" v-model="form.link" placeholder="Link in English" />
                            <InputError :message="form.errors.link" />
                        </div>

                        <!-- رفع الصورة -->
                        <div class="grid gap-2">
                            <Label for="image">Image</Label>
                            <Input id="image" type="file" accept="image/*" @change="handleImageInput" />
                            <div class="flex space-x-2">
                                <img v-if="currentNews.image" :src="currentNews.image" alt="" :class="[imagePreview ? 'opacity-30' : '', 'h-12 w-12 rounded object-cover']">
                                <img v-if="imagePreview" :src="imagePreview" alt="" class="object-cover w-12 h-12 rounded">
                            </div>
                            <InputError :message="form.errors.image" />
                        </div>

                        <!-- زر الإرسال -->
                        <Button type="submit" class="w-full mt-4" :disabled="form.processing">
                            <LoaderCircle v-if="form.processing" class="w-4 h-4 animate-spin" />
                            Update News
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </AppLayout>
</template>
