<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sun, Moon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const isDarkMode = ref(false);

const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    if (isDarkMode.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
};

onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        isDarkMode.value = true;
        document.documentElement.classList.add('dark');
    }
});
</script>

<template>
  <TooltipProvider :delay-duration="0">
      <Tooltip>
          <TooltipTrigger as-child>
              <Button variant="ghost" size="icon" @click="toggleTheme" class="w-12 h-12 text-gray-700 rounded-full dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
                  <Sun v-if="!isDarkMode" class="w-8 h-8" />
                  <Moon v-else class="w-8 h-8" />
              </Button>
          </TooltipTrigger>
          <TooltipContent><p>الوضع {{ isDarkMode ? 'النهاري' : 'الليلي' }}</p></TooltipContent>
      </Tooltip>
  </TooltipProvider>
</template>
