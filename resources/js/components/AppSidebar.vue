<script setup lang="ts">
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/vue3';
import { BookOpen, LayoutGrid, Film, User, Shield, Key, TagIcon, Github, Calendar, Building2, Languages } from 'lucide-vue-next';
import AppLogo from './AppLogo.vue';
import { useAuth } from '@/composables/useAuth';

// ✅ استخدم كومبوزابل useAuth
const { can } = useAuth()






// ✅ القائمة الرئيسية
const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    // Posts - فقط للمستخدمين الذين لديهم صلاحية page-post أو admin
    ...(can('admin') || can('page-post') ? [
        {
            title: 'Moves + series',
            href: '/posts',
            icon: Film,
        },
    ] : []),

       ...(can('admin') || can('page-animes') ? [
        {
            title: 'Animes',
            href: '/animes',
            icon: Film,
        },
    ] : []),
      ...(can('admin') || can('page-episodes') ? [
        {
            title: 'episodes',
            href: '/episodes',
            icon: Film,
        },
    ] : []),



    // فقط للمسؤول
    ...(can('admin') ? [
        {
            title: 'Users',
            href: '/users',
            icon: User,
        },
        {
            title: 'Roles',
            href: '/roles',
            icon: Shield,
        },
        {
            title: 'Permissions',
            href: '/permissions',
            icon: Key,
        },
    ] : []),
    // Types - فقط للمستخدمين الذين لديهم صلاحية page-type أو admin
    ...(can('admin') || can('page-type') ? [
        {
            title: 'Types',
            href: '/web-settings/types',
            icon: TagIcon,
        },
    ] : []),
    // Category - فقط للمستخدمين الذين لديهم صلاحية page-category أو admin
    ...(can('admin') || can('page-category') ? [
        {
            title: 'Category',
            href: '/categories',
            icon: TagIcon,
        },
    ] : []),
    // Seasons - فقط للمستخدمين الذين لديهم صلاحية page-season أو admin
    ...(can('admin') || can('page-season') ? [
        {
            title: 'Seasons',
            href: '/web-settings/seasons',
            icon: Calendar,
        },
    ] : []),
    // Studios - فقط للمستخدمين الذين لديهم صلاحية page-studio أو admin
    ...(can('admin') || can('page-studio') ? [
        {
            title: 'Studios',
            href: '/web-settings/studios',
            icon: Building2,
        },
    ] : []),
    // Languages - فقط للمستخدمين الذين لديهم صلاحية page-language أو admin
    ...(can('admin') || can('page-language') ? [
        {
            title: 'Languages',
            href: '/web-settings/languages',
            icon: Languages,
        },
    ] : []),
];

const footerNavItems: NavItem[] = [
    {
        title: 'Github Repo',
        href: 'https://github.com/laravel/vue-starter-kit',
        icon: Github,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="route('dashboard')">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
        </SidebarContent>

        <SidebarFooter>
            <NavFooter :items="footerNavItems" />
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
