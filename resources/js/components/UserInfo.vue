<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/composables/useInitials';
import type { User } from '@/types';
import { computed } from 'vue';

interface Props {
    user: User;
    showEmail?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    showEmail: false,
});

const { getInitials } = useInitials();

// Compute whether we should show the avatar image
const showAvatar = computed(() => props.user.avatar && props.user.avatar !== '');

const avatarUrl = computed(() => {
  if (props.user.avatar) {
    return `/storage/${props.user.avatar}`; // يضيف مجلد public/storage تلقائيًا
  }
  return null;
});

</script>

<template>
    <Avatar class="w-8 h-8 overflow-hidden rounded-lg">
        <AvatarImage v-if="avatarUrl" :src="avatarUrl" :alt="user.name" />
        <AvatarFallback class="text-black rounded-lg dark:text-white">
            {{ getInitials(user.name) }}
        </AvatarFallback>
    </Avatar>

    <div class="grid flex-1 text-sm leading-tight text-left">
        <span class="font-medium truncate">{{ user.name }}</span>
        <span v-if="showEmail" class="text-xs truncate text-muted-foreground">{{ user.email }}</span>
    </div>
</template>
