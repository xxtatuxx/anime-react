<script setup lang="ts">
import { Head } from '@inertiajs/vue3';

import AppearanceTabs from '@/components/AppearanceTabs.vue';
import HeadingSmall from '@/components/HeadingSmall.vue';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/AR-HomeLayout.vue';
import SettingsLayout from '@/layouts/settings/ar-Layout.vue';

const breadcrumbItems: BreadcrumbItem[] = [
    {
        title: 'إعدادات المظهر',
        href: '/ar/settings/appearance',
    },
];
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbItems">
        <Head title="إعدادات المظهر" />

        <SettingsLayout>
            <div class="space-y-6">
                <HeadingSmall 
                    title="إعدادات المظهر" 
                    description="تحديث إعدادات مظهر حسابك" 
                />
                <AppearanceTabs />
            </div>
        </SettingsLayout>
    </AppLayout>
</template>
