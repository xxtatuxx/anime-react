<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

defineOptions({
    inheritAttrs: false,
});

interface Props {
    className?: HTMLAttributes['class'];
}

defineProps<Props>();
</script>

<template>
  <img
   
    src="/ANIME L.png" 
    alt="Logo"
    class="bg-white rounded w-14"
  />
</template>
