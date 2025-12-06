import type { PageProps } from '@inertiajs/core';
import type { LucideIcon } from 'lucide-vue-next';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon;
    isActive?: boolean;
}

export interface SharedData extends PageProps {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export type BreadcrumbItemType = BreadcrumbItem;


export type PostForm = {
    title: string;
    content: string;
    image: File | null;
    _method?: string;
};

export type Post = {
    id: number;
    title: string;
    content: string;
    image: string;
    slug: string;
};

export type Anime = {
    id: number;
    title: string;
    description?: string;
    slug?: string;
    [key: string]: any;
};

export type Episode = {
    id: number;
    series_id: number;
    title: string;
    title_en?: string;
    slug: string;
    slug_en?: string;
    episode_number: number;
    description?: string;
    description_en?: string;
    thumbnail?: string;
    banner?: string;
    video_url?: string;
    duration?: number;
    quality?: string;
    video_format?: string;
    release_date?: string;
    is_published: boolean;
    language: string;
    subtitles?: string[];
    rating: number;
    views_count: number;
    likes_count: number;
    series?: Anime;
    created_at: string;
    updated_at: string;
};

export type EpisodeForm = {
    series_id: number;
    title: string;
    title_en?: string;
    slug?: string;
    slug_en?: string;
    episode_number: number;
    description?: string;
    description_en?: string;
    thumbnail?: File | null;
    banner?: File | null;
    video_url?: string;
    duration?: number;
    quality?: string;
    video_format?: string;
    release_date?: string;
    is_published?: boolean;
    language?: string;
    subtitles?: string[];
    rating?: number;
    _method?: string;
};
