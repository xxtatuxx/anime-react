<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/vue3';
import { LoaderCircle } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/InputError.vue';

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Create Type', href: '/web-settings/types' },
];

// الحصول على بيانات المستخدم الحالي
const page = usePage<{ auth: { user: any } }>()
const currentUser = page.props.auth.user

// إعداد النموذج
const form = useForm({
    type: '',
    name_en: '',
    slug: '', // حر كما يكتبه المستخدم
    is_active: true,
    user_id: currentUser.id, // ربط النوع بالمستخدم الحالي
});

// إرسال النموذج
const submit = () => {
    form.post('/web-settings/types', {
        onSuccess: () => {
            form.reset();
        }
    });
};
</script>

<template>
    <Head title="Create Type" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">
            <div class="p-6 mx-auto mt-8 bg-white shadow-lg min-w-md dark:bg-neutral-800 rounded-xl">
                <form @submit.prevent="submit" class="flex flex-col gap-6">
                    <div class="grid gap-6">

                        <!-- حقل الاسم -->
                        <div class="grid gap-2">
                            <Label for="type">Type</Label>
                            <Input id="type" type="text" v-model="form.type" placeholder="Enter type name" />
                            <InputError :message="form.errors.type" />
                        </div>

                        <!-- حقل الاسم الإنجليزي -->
                        <div class="grid gap-2">
                            <Label for="name_en">Name (EN)</Label>
                            <Input id="name_en" type="text" v-model="form.name_en" placeholder="Enter English name" />
                            <InputError :message="form.errors.name_en" />
                        </div>

                        <!-- حقل slug -->
                        <div class="grid gap-2">
                            <Label for="slug">Slug</Label>
                            <Input id="slug" type="text" v-model="form.slug" placeholder="Write slug as you want" />
                            <InputError :message="form.errors.slug" />
                        </div>

                        <!-- حالة النوع -->
                        <div class="grid gap-2">
                            <Label for="is_active">Active</Label>
                            <input id="is_active" type="checkbox" v-model="form.is_active" class="checkbox" />
                            <InputError :message="form.errors.is_active" />
                        </div>

                        <!-- زر الإرسال -->
                        <Button type="submit" class="w-full mt-4" :disabled="form.processing">
                            <LoaderCircle v-if="form.processing" class="w-4 h-4 animate-spin" />
                            Create
                        </Button>

                    </div>
                </form>
            </div>
        </div>
    </AppLayout>
</template>
