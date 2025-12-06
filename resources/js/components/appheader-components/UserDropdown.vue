<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { User, LogIn, UserPlus, Home } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import UserMenuContent from '@/components/ar-UserMenuContent.vue';

defineProps<{
  auth: any;
}>();

const getAvatarUrl = (avatar: string) => {
  if (avatar.startsWith('avatars/')) {
    return `/storage/${avatar}`;
  }
  return `/storage/avatars/${avatar}`;
};
</script>

<template>
  <div>
      <!-- زر المستخدم مسجّل الدخول -->
    <DropdownMenu v-if="auth?.user">
      <DropdownMenuTrigger :as-child="true">
        <Button variant="ghost" size="icon" class="relative w-10 h-10 overflow-hidden transition-all rounded-full ring-2 ring-transparent hover:ring-indigo-500/20">
          
          <!-- صورة المستخدم -->
          <img
            v-if="auth.user.avatar"
            :src="getAvatarUrl(auth.user.avatar)"
            :alt="auth.user.name"
            class="object-cover w-full h-full rounded-full"
          />

          <!-- أول حرف من الاسم إذا لا يوجد صورة -->
          <div
            v-else
            class="flex items-center justify-center w-full h-full text-lg font-bold text-white bg-indigo-600"
          >
            <span>{{ auth.user.name ? auth.user.name.charAt(0).toUpperCase() : '?' }}</span>
          </div>
          
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" class="w-56 mt-2 rounded-xl border-gray-100 dark:border-neutral-800 bg-white dark:bg-[#111]">
        <UserMenuContent :user="auth.user" />
      </DropdownMenuContent>
    </DropdownMenu>


      <!-- زر المستخدم غير مسجّل الدخول -->
    <DropdownMenu v-if="!auth?.user">
      <DropdownMenuTrigger :as-child="true">
        <Button
          variant="ghost"
          size="icon"
          class="relative w-10 h-10 transition-all bg-white rounded-full shadow-sm ring-1 ring-transparent hover:ring-indigo-500/30 dark:hover:ring-indigo-400/30 dark:bg-neutral-900"
        >
          <User class="w-5 h-5 text-black dark:text-white" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        class="w-60 mt-2 rounded-xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-[#111] shadow-xl p-2"
      >
        <!-- تسجيل الدخول -->
        <DropdownMenuItem>
          <Link href="/ar/login" class="flex items-center w-full gap-3">
            <LogIn class="w-4 h-4 text-black dark:text-white" />
            <span>تسجيل الدخول</span>
          </Link>
        </DropdownMenuItem>

        <!-- تسجيل حساب جديد -->
        <DropdownMenuItem>
          <Link href="/ar/register" class="flex items-center w-full gap-3">
            <UserPlus class="w-4 h-4 text-black dark:text-white" />
            <span>تسجيل حساب جديد</span>
          </Link>
        </DropdownMenuItem>

        <!-- العودة للصفحة الرئيسية -->
        <DropdownMenuItem>
          <Link href="/" class="flex items-center w-full gap-3">
            <Home class="w-4 h-4 text-black dark:text-white" />
            <span>العودة إلى الصفحة الرئيسية</span>
          </Link>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
