<script setup lang="ts">
import InputError from '@/components/InputError.vue';
import TextLink from '@/components/TextLink.vue';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthBase from '@/layouts/AuthLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { LoaderCircle } from 'lucide-vue-next';
import AppLayout from "@/layouts/AR-HomeLayout.vue";


defineProps<{
    status?: string;
    canResetPassword: boolean;
}>();

const form = useForm({
    email: '',
    password: '',
    remember: false,
});

const submit = () => {
    form.post(route('login'), {
        onFinish: () => form.reset('password'),
    });
};
</script>

<template>
    <AppLayout>
        <AuthBase title="تسجيل الدخول إلى حسابك" description="أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول">
        <Head title="تسجيل الدخول" />

        <div v-if="status" class="mb-4 text-sm font-medium text-center text-green-600">
            {{ status }}
        </div>

        <form @submit.prevent="submit" class="flex flex-col gap-6">
            <div class="grid gap-6">
                <div class="grid gap-2">
                    <Label for="email">عنوان البريد الإلكتروني</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        autofocus
                        :tabindex="1"
                        autocomplete="email"
                        v-model="form.email"
                        placeholder="email@example.com"
                    />
                    <InputError :message="form.errors.email" />
                </div>

                <div class="grid gap-2">
                    <div class="flex items-center justify-between">
                        <Label for="password">كلمة المرور</Label>
                        <TextLink v-if="canResetPassword" :href="route('ar.password.request')" class="text-sm" :tabindex="5">
                            هل نسيت كلمة المرور؟
                        </TextLink>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        :tabindex="2"
                        autocomplete="current-password"
                        v-model="form.password"
                        placeholder="كلمة المرور"
                    />
                    <InputError :message="form.errors.password" />
                </div>

                <div class="flex items-center justify-between" :tabindex="3">
                    <Label for="remember" class="flex items-center space-x-3">
                        <Checkbox id="remember" v-model:checked="form.remember" :tabindex="4" />
                        <span>تذكرني</span>
                    </Label>
                </div>

                <Button type="submit" class="w-full mt-4" :tabindex="4" :disabled="form.processing">
                    <LoaderCircle v-if="form.processing" class="w-4 h-4 animate-spin" />
                    تسجيل الدخول
                </Button>
            </div>

            <div class="text-sm text-center text-muted-foreground">
                ليس لديك حساب؟
                <TextLink :href="route('ar.register')" :tabindex="5">إنشاء حساب</TextLink>
            </div>
        </form>
    </AuthBase>
    
    
    
    </AppLayout>

</template>
