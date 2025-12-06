<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { PostForm, type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/vue3';
import { LoaderCircle } from 'lucide-vue-next';
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/InputError.vue';
import { ref } from 'vue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add moves + series',
        href: '/posts',
    },
];

// ✨ إعداد البيانات
const form = useForm({
    title: '',
    content: '',
    images: [] as File[],
});

const imagePreviews = ref<string[]>([]);

// ✨ عند اختيار الصور
const handleImageInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files ? Array.from(target.files) : [];

    form.images = files;
    imagePreviews.value = files.map(file => URL.createObjectURL(file));
};

// ✨ الإرسال إلى Laravel
const submit = () => {
    const data = new FormData();
    data.append('title', form.title);
    data.append('content', form.content);

    form.images.forEach((file, index) => {
        data.append(`images[${index}]`, file);
    });

    router.post(route('posts.store'), data, {
        forceFormData: true, // مهم جدًا حتى يرسل الملفات كـ FormData
        onFinish: () => {
            imagePreviews.value = [];
            form.reset('images');
        },
    });
};
</script>

<template>
    <Head title="Create Post" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">
            <div class="p-6 mx-auto mt-8 bg-white shadow-lg min-w-md dark:bg-neutral-800 rounded-xl">
                <form @submit.prevent="submit" class="flex flex-col gap-6">
                    <div class="grid gap-6">
                        <!-- 🟢 العنوان -->
                        <div class="grid gap-2">
                            <Label for="title">Title</Label>
                            <Input
                                id="title"
                                type="text"
                                autofocus
                                :tabindex="1"
                                autocomplete="title"
                                v-model="form.title"
                                placeholder="First post"
                            />
                            <InputError :message="form.errors.title" />
                        </div>

                        <!-- 🟢 رفع الصور -->
                        <div class="grid gap-2">
                            <Label for="images">Images</Label>
                            <Input
                                id="images"
                                type="file"
                                multiple
                                :tabindex="2"
                                @change="handleImageInput"
                            />
                            <div class="flex flex-wrap gap-2 mt-2">
                                <img
                                    v-for="(src, i) in imagePreviews"
                                    :key="i"
                                    :src="src"
                                    alt="preview"
                                    class="object-cover w-16 h-16 border border-gray-300 rounded"
                                />
                            </div>
                            <InputError :message="form.errors.images" />
                        </div>

                        <!-- 🟢 المحتوى -->
                        <div class="grid gap-2">
                            <Label for="content">Content</Label>
                            <Textarea
                                id="content"
                                autofocus
                                :tabindex="3"
                                autocomplete="content"
                                v-model="form.content"
                                placeholder="First post"
                            />
                            <InputError :message="form.errors.content" />
                        </div>

                        <!-- 🟢 زر الإرسال -->
                        <Button type="submit" class="w-full mt-4" :tabindex="4" :disabled="form.processing">
                            <LoaderCircle v-if="form.processing" class="w-4 h-4 animate-spin" />
                            Create
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </AppLayout>
</template>
