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
    { title: 'إنشاء استوديو', href: '/web-settings/studios' },
];

// الحصول على بيانات المستخدم الحالي
const page = usePage<{ auth: { user: any } }>()
const currentUser = page.props.auth.user

// إعداد النموذج
const form = useForm({
    name: '',
    name_en: '',
    slug: '',
    date: '',
    is_active: true,
    user_id: currentUser.id,
});

// إرسال النموذج
const submit = () => {
    form.post('/web-settings/studios', {
        onSuccess: () => {
            form.reset();
        }
    });
};
</script>

<template>
    <Head title="إنشاء استوديو" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">
            <div class="p-6 mx-auto mt-8 bg-white shadow-lg min-w-md dark:bg-neutral-800 rounded-xl">
                <form @submit.prevent="submit" class="flex flex-col gap-6">
                    <div class="grid gap-6">

                        <!-- حقل اسم الاستوديو بالعربي -->
                        <div class="grid gap-2">
                            <Label for="name">اسم الاستوديو (عربي)</Label>
                            <Input id="name" type="text" v-model="form.name" placeholder="أدخل اسم الاستوديو بالعربي" />
                            <InputError :message="form.errors.name" />
                        </div>

                        <!-- حقل اسم الاستوديو بالإنجليزي -->
                        <div class="grid gap-2">
                            <Label for="name_en">اسم الاستوديو (إنجليزي)</Label>
                            <Input id="name_en" type="text" v-model="form.name_en" placeholder="Enter studio name in English" />
                            <InputError :message="form.errors.name_en" />
                        </div>

                        <!-- حقل slug -->
                        <div class="grid gap-2">
                            <Label for="slug">Slug</Label>
                            <Input id="slug" type="text" v-model="form.slug" placeholder="اكتب slug كما تريد" />
                            <InputError :message="form.errors.slug" />
                        </div>

                        <!-- حقل التاريخ -->
                        <div class="grid gap-2">
                            <Label for="date">التاريخ</Label>
                            <Input id="date" type="date" v-model="form.date" />
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

                        <!-- زر الإرسال -->
                        <Button type="submit" class="w-full mt-4" :disabled="form.processing">
                            <LoaderCircle v-if="form.processing" class="w-4 h-4 animate-spin" />
                            إنشاء
                        </Button>

                    </div>
                </form>
            </div>
        </div>
    </AppLayout>
</template>

