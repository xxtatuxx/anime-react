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
    { title: 'Edit Type', href: '/web-settings/types' },
];

// بيانات النوع
const page = usePage<{ type: { id: number; type: string; name_en: string; slug: string; is_active: number; user?: { id: number, name: string, avatar?: string } } }>();
const typeData = page.props.type;

// الحصول على بيانات المستخدم الحالي (إذا رغبت بالربط عند التحديث)
const currentUser = page.props.auth?.user || null;

// إعداد النموذج
const form = useForm({
    type: typeData.type,
    name_en: typeData.name_en,
    slug: typeData.slug, // سيأخذ القيمة كما هي
    is_active: typeData.is_active === 1,
    user_id: typeData.user?.id || currentUser?.id || null, // ربط المستخدم
});

// إرسال النموذج للتحديث
const submit = () => {
    form.put(`/web-settings/types/${typeData.id}`, {
        onSuccess: () => {
            // Flash message handled by Laravel redirect
        }
    });
};
</script>

<template>
    <Head title="Edit Type" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">
            <div class="p-6 mx-auto mt-8 bg-white shadow-lg min-w-md dark:bg-neutral-800 rounded-xl">
                <form @submit.prevent="submit" class="flex flex-col gap-6">
                    <div class="grid gap-6">

                        <!-- حقل الاسم -->
                        <div class="grid gap-2">
                            <Label for="type">Type</Label>
                            <Input
                                id="type"
                                type="text"
                                autofocus
                                v-model="form.type"
                                placeholder="Enter type name"
                            />
                            <InputError :message="form.errors.type" />
                        </div>

                        <!-- حقل الاسم الإنجليزي -->
                        <div class="grid gap-2">
                            <Label for="name_en">Name (EN)</Label>
                            <Input
                                id="name_en"
                                type="text"
                                v-model="form.name_en"
                                placeholder="Enter English name"
                            />
                            <InputError :message="form.errors.name_en" />
                        </div>

                        <!-- حقل slug -->
                        <div class="grid gap-2">
                            <Label for="slug">Slug</Label>
                            <Input
                                id="slug"
                                type="text"
                                v-model="form.slug"
                                placeholder="Write slug as you want"
                            />
                            <InputError :message="form.errors.slug" />
                        </div>

                        <!-- حالة النوع -->
                        <div class="grid gap-2">
                            <Label for="is_active">Status</Label>
                            <select
                                id="is_active"
                                v-model="form.is_active"
                                class="p-2 text-black bg-white border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option :value="true">Active</option>
                                <option :value="false">Inactive</option>
                            </select>
                            <InputError :message="form.errors.is_active" />
                        </div>

                        <!-- زر الحفظ -->
                        <Button type="submit" class="w-full mt-4" :disabled="form.processing">
                            <LoaderCircle v-if="form.processing" class="w-4 h-4 animate-spin" />
                            Save Changes
                        </Button>

                        <!-- عرض معلومات المستخدم المرتبط -->
                        <div v-if="typeData.user || currentUser" class="flex items-center gap-4 mt-4">
                            <img
                                v-if="typeData.user?.avatar || currentUser?.avatar"
                                :src="typeData.user?.avatar || currentUser?.avatar"
                                alt="User Avatar"
                                class="w-10 h-10 rounded-full"
                            />
                            <span class="font-medium text-gray-700">
                                {{ typeData.user?.name || currentUser?.name }}
                            </span>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    </AppLayout>
</template>
