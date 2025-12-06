<script setup lang="ts">
import InputError from '@/components/InputError.vue';
import AppLayout from '@/layouts/AR-HomeLayout.vue';
import SettingsLayout from '@/layouts/settings/ar-Layout.vue';
import { TransitionRoot } from '@headlessui/vue';
import { Head, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

import HeadingSmall from '@/components/HeadingSmall.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

const breadcrumbItems: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: '/ar/settings/password',
    },
];

const passwordInput = ref<HTMLInputElement | null>(null);
const currentPasswordInput = ref<HTMLInputElement | null>(null);

const form = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
});

const updatePassword = () => {
    form.put(route('password.update'), {
        preserveScroll: true,
        onSuccess: () => form.reset(),
        onError: (errors: any) => {
            if (errors.password) {
                form.reset('password', 'password_confirmation');
                if (passwordInput.value instanceof HTMLInputElement) {
                    passwordInput.value.focus();
                }
            }

            if (errors.current_password) {
                form.reset('current_password');
                if (currentPasswordInput.value instanceof HTMLInputElement) {
                    currentPasswordInput.value.focus();
                }
            }
        },
    });
};
</script>
<template>
    <AppLayout :breadcrumbs="breadcrumbItems">
        <Head title="إعدادات كلمة المرور" />

        <SettingsLayout>
            <div class="space-y-6">
                <HeadingSmall 
                    title="تحديث كلمة المرور" 
                    description="تأكد من أن حسابك يستخدم كلمة مرور طويلة وعشوائية للبقاء آمنًا" 
                />

                <form @submit.prevent="updatePassword" class="space-y-6">
                    <!-- كلمة المرور الحالية -->
                    <div class="grid gap-2">
                        <Label for="current_password">كلمة المرور الحالية</Label>
                        <Input
                            id="current_password"
                            ref="currentPasswordInput"
                            v-model="form.current_password"
                            type="password"
                            class="block w-full mt-1"
                            autocomplete="current-password"
                            placeholder="كلمة المرور الحالية"
                        />
                        <InputError :message="form.errors.current_password" />
                    </div>

                    <!-- كلمة المرور الجديدة -->
                    <div class="grid gap-2">
                        <Label for="password">كلمة المرور الجديدة</Label>
                        <Input
                            id="password"
                            ref="passwordInput"
                            v-model="form.password"
                            type="password"
                            class="block w-full mt-1"
                            autocomplete="new-password"
                            placeholder="كلمة المرور الجديدة"
                        />
                        <InputError :message="form.errors.password" />
                    </div>

                    <!-- تأكيد كلمة المرور -->
                    <div class="grid gap-2">
                        <Label for="password_confirmation">تأكيد كلمة المرور</Label>
                        <Input
                            id="password_confirmation"
                            v-model="form.password_confirmation"
                            type="password"
                            class="block w-full mt-1"
                            autocomplete="new-password"
                            placeholder="تأكيد كلمة المرور"
                        />
                        <InputError :message="form.errors.password_confirmation" />
                    </div>

                    <!-- زر الحفظ -->
                    <div class="flex items-center gap-4">
                        <Button :disabled="form.processing">حفظ كلمة المرور</Button>

                        <TransitionRoot
                            :show="form.recentlySuccessful"
                            enter="transition ease-in-out"
                            enter-from="opacity-0"
                            leave="transition ease-in-out"
                            leave-to="opacity-0"
                        >
                            <p class="text-sm text-neutral-600">تم الحفظ</p>
                        </TransitionRoot>
                    </div>
                </form>
            </div>
        </SettingsLayout>
    </AppLayout>
</template>
