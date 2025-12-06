<script setup lang="ts">
import AppContent from '@/components/AppContent.vue';
import AppShell from '@/components/AppShell.vue';
import AppSidebar from '@/components/AppSidebar.vue';
import AppSidebarHeader from '@/components/AppSidebarHeader.vue';
import type { BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth';

interface Props {
    breadcrumbs?: BreadcrumbItemType[];
}

withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
});

// التحقق من صلاحيات المستخدم لعرض Sidebar
const page = usePage<{ auth?: { user?: any }; authUser?: any }>();

const canViewSidebar = computed(() => {
    // يظهر Sidebar فقط للمستخدمين الذين لديهم دور admin أو Admin Assistant
    const user = page.props.authUser || page.props.auth?.user;
    if (!user) return false;
    
    const roles = user.roles || [];
    
    // التحقق من الأدوار - دعم كلا النوعين (strings و objects)
    let hasAdminRole = false;
    let hasAssistantRole = false;
    
    if (Array.isArray(roles) && roles.length > 0) {
        // التحقق من نوع البيانات
        const firstRole = roles[0];
        
        if (typeof firstRole === 'string') {
            // إذا كانت مصفوفة من strings
            hasAdminRole = roles.includes('admin');
            hasAssistantRole = roles.includes('Admin Assistant');
        } else if (firstRole && typeof firstRole === 'object') {
            // إذا كانت مصفوفة من objects
            hasAdminRole = roles.some((r: any) => r && (r.name === 'admin' || r === 'admin'));
            hasAssistantRole = roles.some((r: any) => r && (r.name === 'Admin Assistant' || r === 'Admin Assistant'));
        }
    }
    
    return hasAdminRole || hasAssistantRole;
});
</script>

<template>
    <AppShell v-if="canViewSidebar" variant="sidebar">
        <AppSidebar />
        <AppContent variant="sidebar">
            <AppSidebarHeader :breadcrumbs="breadcrumbs" />
            <slot />
        </AppContent>
    </AppShell>
    <div v-else class="flex min-h-screen w-full flex-col">
        <div class="flex-1">
            <slot />
        </div>
    </div>
</template>
