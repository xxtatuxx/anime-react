<template>
  <div class="relative">
    <select
      v-model="model"
      class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-indigo-300 dark:bg-gray-800 dark:text-white"
    >
      <slot />
    </select>
  </div>
</template>

<script setup lang="ts">
import { defineModel } from 'vue'

// يربط المكون مع v-model
const model = defineModel<string | number>()
</script>
