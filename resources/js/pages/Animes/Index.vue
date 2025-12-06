<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/AppLayout.vue';
import { Head, Link, usePage, router as inertia } from '@inertiajs/vue3';
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { toast } from 'vue-sonner';
import { Input } from '@/components/ui/input';
import Fuse from 'fuse.js';
import { useAuth } from '@/composables/useAuth';

const breadcrumbs = [
  { title: 'Animes', href: '/animes' },
];

const page = usePage<{ animes: any, flash?: { success?: string }, auth: { user: any } }>();
const animes = ref([...page.props.animes.data]);
const allAnimes = ref([...page.props.animes.data]);
const nextPageUrl = ref(page.props.animes.next_page_url);
const search = ref('');
const loading = ref(false);
const loadingSkeleton = ref(false);

// إعداد Fuse.js للبحث الذكي
let fuse = new Fuse(allAnimes.value, {
  keys: ['title', 'slug', 'genre', 'user.name'],
  includeScore: true,
  threshold: 0.4,
  distance: 100,
});

// البحث التلقائي أثناء الكتابة
watch(search, (value) => {
  if (!value) {
    animes.value = [...allAnimes.value];
  } else {
    animes.value = fuse.search(value).map(r => r.item);
  }
});

// عرض الفلاش مرة واحدة
onMounted(() => {
  if (page.props.flash?.success) {
    toast.success(page.props.flash.success);
    page.props.flash.success = null;
  }
  window.addEventListener('scroll', onScroll);

  // إزالة أي query params عند تحديث الصفحة
  const url = new URL(window.location.href);
  if (url.search) {
    window.history.replaceState({}, '', url.pathname);
  }
});

// إزالة الاستماع عند الخروج
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

// الصلاحيات
const { can } = useAuth();
const canAnime = (action: 'create-anime' | 'update-anime' | 'delete-anime') => {
  const user = page.props.auth.user;
  if (can('admin')) return true;
  if (can(action)) return true;
  const userRoles = user.roles || [];
  for (const role of userRoles) {
    if (role.permissions?.includes(action)) return true;
  }
  return false;
};

// حذف الأنمي بدون إعادة تحميل الصفحة
const deleteAnime = (id: number) => {
  if (!confirm('هل أنت متأكد من حذف هذا الأنمي؟')) return;

  inertia.delete(`/animes/${id}`, {
    onSuccess: () => {
      animes.value = animes.value.filter(a => a.id !== id);
      allAnimes.value = allAnimes.value.filter(a => a.id !== id);
      toast.success('تم حذف الأنمي بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحذف');
    },
  });
};

// تحميل المزيد عند التمرير
const loadMore = () => {
  if (!nextPageUrl.value || loading.value) return;

  loading.value = true;
  loadingSkeleton.value = true;

  inertia.get(nextPageUrl.value, {}, {
    preserveScroll: true,
    preserveState: true,
    replace: true,
    only: ['animes'],
    onSuccess: (pageResponse) => {
      const newData = pageResponse.props.animes.data;
      const existingIds = new Set(animes.value.map(a => a.id));
      const filteredData = newData.filter(a => !existingIds.has(a.id));
      animes.value.push(...filteredData);
      allAnimes.value.push(...filteredData);

      nextPageUrl.value = pageResponse.props.animes.next_page_url;

      fuse = new Fuse(animes.value, {
        keys: ['title', 'slug', 'genre', 'user.name'],
        includeScore: true,
        threshold: 0.4,
        distance: 100,
      });
    },
    onFinish: () => {
      loading.value = false;
      loadingSkeleton.value = false;
    },
  });
};

const onScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const bottom = document.documentElement.offsetHeight - 50;
  if (scrollPosition >= bottom) {
    loadMore();
  }
};

</script>

<template>
  <Head title="Animes" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">

      <!-- زر إضافة + مربع البحث -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Link
          v-if="canAnime('create-anime')"
          href="/animes/create"
          class="font-medium text-indigo-500 hover:text-indigo-600"
        >
          + إضافة أنمي
        </Link>

        <div class="flex w-full gap-2 md:w-1/3">
          <Input
            v-model="search"
            placeholder="Search animes..."
            class="w-full h-10"
          />
        </div>
      </div>

      <!-- جدول الأنميات -->
      <div class="relative flex-1 border rounded-xl border-sidebar-border/70">
        <Table>
          <TableCaption>قائمة جميع الأنميات.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[50px]">ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Cover</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="anime in animes" :key="anime.id">
              <TableCell>{{ anime.id }}</TableCell>

              <!-- صورة الأنمي -->
              <TableCell>
                <img
                  v-if="anime.image"
                  :src="`/storage/${anime.image}`"
                  alt="anime"
                  class="object-cover w-12 h-12 rounded"
                />
                <span v-else>-</span>
              </TableCell>

              <!-- غلاف الأنمي -->
              <TableCell>
                <img
                  v-if="anime.cover"
                  :src="`/storage/${anime.cover}`"
                  alt="cover"
                  class="object-cover w-12 h-12 rounded"
                />
                <span v-else>-</span>
              </TableCell>

              <!-- مستخدم الأنمي -->
              <TableCell>{{ anime.user?.name || 'N/A' }}</TableCell>

              <TableCell>{{ anime.title }}</TableCell>
             <TableCell>
  <div v-if="anime.categories && anime.categories.length">
    <span
      v-for="(category, index) in anime.categories"
      :key="index"
      class="inline-block px-2 py-1 mb-1 mr-1 text-xs text-white bg-indigo-500 rounded-md"
    >
      {{ category.name }}
    </span>
  </div>
  <span v-else>-</span>
</TableCell>

              <TableCell>{{ anime.rating || '-' }}</TableCell>
              <TableCell>
                <span v-if="anime.is_active" class="font-medium text-green-500">Active</span>
                <span v-else class="font-medium text-red-500">Inactive</span>
              </TableCell>

              <!-- الإجراءات -->
              <TableCell class="flex justify-end gap-2">
                <Link
                  :href="route('animes.show', anime.id)"
                  class="text-blue-500 hover:text-blue-600"
                >
                  Details
                </Link>

                <Link
                  v-if="canAnime('update-anime')"
                  :href="`/animes/${anime.id}/edit`"
                  class="text-indigo-500 hover:text-indigo-600"
                >
                  Edit
                </Link>

                <button
                  v-if="canAnime('delete-anime')"
                  @click="deleteAnime(anime.id)"
                  class="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </TableCell>
            </TableRow>

            <TableRow v-if="animes.length === 0 && !loadingSkeleton">
              <TableCell colspan="9" class="py-4 text-center text-gray-500">
                No animes found
              </TableCell>
            </TableRow>

            <!-- Loader -->
            <TableRow v-if="loadingSkeleton">
              <TableCell colspan="9" class="py-6">
                <div class="flex justify-center w-full">
                  <div role="status" class="w-full max-w-full space-y-4 animate-pulse">
                    <div class="w-2/3 h-4 mx-auto bg-gray-200 rounded-full dark:bg-gray-700"></div>
                    <div class="w-5/6 h-4 mx-auto bg-gray-200 rounded-full dark:bg-gray-700"></div>
                    <div class="w-3/4 h-4 mx-auto bg-gray-200 rounded-full dark:bg-gray-700"></div>
                    <div class="w-11/12 h-4 mx-auto bg-gray-200 rounded-full dark:bg-gray-700"></div>
                    <span class="sr-only">Loading...</span>
                  </div>
                </div>
              </TableCell>
            </TableRow>

          </TableBody>
        </Table>

        <div v-if="!nextPageUrl && !loadingSkeleton" class="py-4 text-center text-gray-500">
          No more data
        </div>
      </div>

    </div>
  </AppLayout>
</template>
