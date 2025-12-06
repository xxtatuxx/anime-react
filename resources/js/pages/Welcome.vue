<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
</script>

<template>
    <Head title="Welcome">
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    </Head>
    <div class="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a] lg:justify-center lg:p-8">
        <header class="not-has-[nav]:hidden mb-6 w-full max-w-[335px] text-sm lg:max-w-4xl">
            <nav class="flex items-center justify-end gap-4">
                <Link
                    v-if="$page.props.auth.user"
                    :href="route('dashboard')"
                    class="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                >
                    Dashboard
                </Link>
                <template v-else>
                    <Link
                        :href="route('login')"
                        class="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                    >
                        Log in
                    </Link>
                    <Link
                        :href="route('register')"
                        class="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                    >
                        Register
                    </Link>
                </template>
            </nav>
        </header>
        <div class="flex items-center justify-center w-full transition-opacity opacity-100 duration-750 starting:opacity-0 lg:grow">
            <main class="flex w-full max-w-[335px] flex-col-reverse overflow-hidden rounded-lg lg:max-w-4xl lg:flex-row">
                <div
    class="flex-1 rounded-bl-lg rounded-br-lg bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0,16)] dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d] lg:rounded-br-none lg:rounded-tl-lg lg:p-20"
  >
    <h1 class="mb-1 font-medium">Let's get started</h1>
    <p class="mb-4 text-[#706f6c] dark:text-[#A1A09A]">
      اختر اللغة للانتقال إلى الصفحة المناسبة.
    </p>

    <!-- الكارت العربي -->
    <Link
      href="/ar/home"
      class="block mb-4 rounded-lg border border-[#e3e3e0] bg-[#FDFDFC] p-4 text-[#1C1C1A] shadow-[0px_1px_3px_rgba(0,0,0,0.1)] hover:bg-[#f5f5f5] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC] dark:hover:bg-[#1E1E1C]"
    >
      <h2 class="mb-1 font-medium">زيارة الصفحة باللغة العربية</h2>
      <p class="text-sm text-[#706f6c] dark:text-[#A1A09A]">انتقل إلى الصفحة العربية.</p>
    </Link>

    <!-- الكارت الإنجليزي -->
    <Link
      href="/en/home"
      class="block rounded-lg border border-[#e3e3e0] bg-[#FDFDFC] p-4 text-[#1C1C1A] shadow-[0px_1px_3px_rgba(0,0,0,0.1)] hover:bg-[#f5f5f5] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC] dark:hover:bg-[#1E1E1C]"
    >
      <h2 class="mb-1 font-medium">Visit the page in English</h2>
      <p class="text-sm text-[#706f6c] dark:text-[#A1A09A]">Go to the English page.</p>
    </Link>
  </div>
             <div
    class="relative -mb-px aspect-[335/376] w-full shrink-0 overflow-hidden rounded-t-lg bg-[#fff2f2] dark:bg-[#1D0002] lg:-ml-px lg:mb-0 lg:aspect-auto lg:w-[438px] lg:rounded-r-lg lg:rounded-t-none"
>
    <!-- الصورة تغطي الـ div بالكامل -->
    <img
        src="/naruto_cover.jpg"
        alt="Cover Image"
        class="absolute inset-0 object-cover w-full h-full"
    />

    <!-- الظل الداخلي (Shadow) -->
    <div
        class="absolute inset-0 rounded-t-lg shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d] lg:overflow-hidden lg:rounded-r-lg lg:rounded-t-none"
    ></div>
</div>

            </main>
        </div>
        <div class="h-14.5 hidden lg:block"></div>
    </div>
</template>
