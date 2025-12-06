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
    { title: 'تعديل استوديو', href: '/web-settings/studios' },
];

// بيانات الاستوديو
const page = usePage<{ studio: { id: number; name: string; name_en: string; slug: string; date?: string; is_active: number; user?: { id: number, name: string, avatar?: string } } }>();
const studioData = page.props.studio;

// الحصول على بيانات المستخدم الحالي
const currentUser = page.props.auth?.user || null;

// إعداد النموذج
const form = useForm({
    name: studioData.name,
    name_en: studioData.name_en,
    slug: studioData.slug,
    date: studioData.date ? new Date(studioData.date).toISOString().split('T')[0] : '',
    is_active: studioData.is_active === 1,
    user_id: studioData.user?.id || currentUser?.id || null,
});

// إرسال النموذج للتحديث
const submit = () => {
    form.put(`/web-settings/studios/${studioData.id}`, {
        onSuccess: () => {
            // Flash message handled by Laravel redirect
        }
    });
};
</script>

<template>
    <Head title="تعديل استوديو" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">
            <div class="p-6 mx-auto mt-8 bg-white shadow-lg min-w-md dark:bg-neutral-800 rounded-xl">
                <form @submit.prevent="submit" class="flex flex-col gap-6">
                    <div class="grid gap-6">

                        <!-- حقل اسم الاستوديو بالعربي -->
                        <div class="grid gap-2">
                            <Label for="name">اسم الاستوديو (عربي)</Label>
                            <Input
                                id="name"
                                type="text"
                                autofocus
                                v-model="form.name"
                                placeholder="أدخل اسم الاستوديو بالعربي"
                            />
                            <InputError :message="form.errors.name" />
                        </div>

                        <!-- حقل اسم الاستوديو بالإنجليزي -->
                        <div class="grid gap-2">
                            <Label for="name_en">اسم الاستوديو (إنجليزي)</Label>
                            <Input
                                id="name_en"
                                type="text"
                                v-model="form.name_en"
                                placeholder="Enter studio name in English"
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
                                placeholder="اكتب slug كما تريد"
                            />
                            <InputError :message="form.errors.slug" />
                        </div>

                        <!-- حقل التاريخ -->
                        <div class="grid gap-2">
                            <Label for="date">التاريخ</Label>
                            <Input
                                id="date"
                                type="date"
                                v-model="form.date"
                            />
                            <InputError :message="form.errors.date" />
                        </div>

                        <!-- حالة الاستوديو -->
                        <div class="grid gap-2">
                            <Label for="is_active">الحالة</Label>
                            <select
                                id="is_active"
                                v-model="form.is_active"
                                class="p-2 text-black bg-white border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white"
                            >
                                <option :value="true">مفعل</option>
                                <option :value="false">غير مفعل</option>
                            </select>
                            <InputError :message="form.errors.is_active" />
                        </div>

                        <!-- زر الحفظ -->
                        <Button type="submit" class="w-full mt-4" :disabled="form.processing">
                            <LoaderCircle v-if="form.processing" class="w-4 h-4 animate-spin" />
                            حفظ التغييرات
                        </Button>

                        <!-- عرض معلومات المستخدم المرتبط -->
                        <div v-if="studioData.user || currentUser" class="flex items-center gap-4 mt-4">
                            <img
                                v-if="studioData.user?.avatar || currentUser?.avatar"
                                :src="studioData.user?.avatar ? `/storage/${studioData.user.avatar}` : (currentUser?.avatar ? `/storage/${currentUser.avatar}` : '/default-avatar.png')"
                                alt="User Avatar"
                                class="w-10 h-10 rounded-full"
                            />
                            <span class="font-medium text-gray-700 dark:text-gray-300">
                                {{ studioData.user?.name || currentUser?.name }}
                            </span>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    </AppLayout>
</template>

