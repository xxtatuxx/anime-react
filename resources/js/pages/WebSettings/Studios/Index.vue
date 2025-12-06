<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router as inertia } from '@inertiajs/vue3';
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { toast } from 'vue-sonner';
import { Input } from '@/components/ui/input';
import Fuse from 'fuse.js';
import { useAuth } from '@/composables/useAuth';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Studios', href: '/web-settings/studios' },
];

const page = usePage<{ studios: any, flash?: { success?: string }, auth: { user: any } }>();

// البيانات الأساسية
const studios = ref([...page.props.studios.data]);
const allStudios = ref([...page.props.studios.data]);
const nextPageUrl = ref(page.props.studios.next_page_url);
const search = ref('');
const loading = ref(false);
const loadingSkeleton = ref(false);

// إعداد Fuse.js للبحث الذكي
let fuse = new Fuse(allStudios.value, {
  keys: ['name', 'name_en', 'date', 'user.name'],
  includeScore: true,
  threshold: 0.4,
  distance: 100,
});

// البحث التلقائي أثناء الكتابة
watch(search, (value) => {
  if (!value) {
    studios.value = [...allStudios.value];
  } else {
    studios.value = fuse.search(value).map(r => r.item);
  }
});

// عرض الفلاش مرة واحدة
onMounted(() => {
  if (page.props.flash?.success) {
    toast.success(page.props.flash.success);
    page.props.flash.success = null;
  }
  window.addEventListener('scroll', onScroll);

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
const canStudio = (action: 'create-studio' | 'update-studio' | 'delete-studio') => {
  const user = page.props.auth.user;
  if (can('admin')) return true;
  if (can(action)) return true;
  const userRoles = user.roles || [];
  for (const role of userRoles) {
    if (role.permissions?.includes(action)) return true;
  }
  return false;
};

// حذف بدون إعادة تحميل الصفحة
const deleteStudio = (id: number) => {
  if (!confirm('هل أنت متأكد من حذف هذا الاستوديو؟')) return;

  inertia.delete(`/web-settings/studios/${id}`, {
    onSuccess: () => {
      studios.value = studios.value.filter(s => s.id !== id);
      allStudios.value = allStudios.value.filter(s => s.id !== id);
      toast.success('تم حذف الاستوديو بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحذف');
    },
  });
};

// جلب الصفحة التالية مع Loader بدون تكرار البيانات
const loadMore = () => {
  if (!nextPageUrl.value || loading.value) return;

  loading.value = true;
  loadingSkeleton.value = true;

  inertia.get(nextPageUrl.value, {}, {
    preserveScroll: true,
    preserveState: true,
    replace: true,
    only: ['studios'],
    onSuccess: (pageResponse) => {
      const newData = pageResponse.props.studios.data;

      const existingIds = new Set(studios.value.map(s => s.id));
      const filteredData = newData.filter(s => !existingIds.has(s.id));
      studios.value.push(...filteredData);
      allStudios.value.push(...filteredData);

      nextPageUrl.value = pageResponse.props.studios.next_page_url;

      fuse = new Fuse(studios.value, {
        keys: ['name', 'name_en', 'date', 'user.name'],
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

// مراقبة التمرير
const onScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const bottom = document.documentElement.offsetHeight - 50;
  if (scrollPosition >= bottom) {
    loadMore();
  }
};
</script>

<template>
  <Head title="Studios" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">

      <!-- زر إضافة + مربع البحث -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Link 
          v-if="canStudio('create-studio')" 
          href="/web-settings/studios/create" 
          class="font-medium text-indigo-500 hover:text-indigo-600"
        >
          + إنشاء استوديو
        </Link>

        <div class="flex w-full gap-2 md:w-1/3">
          <Input
            v-model="search"
            placeholder="البحث في الاستوديوهات..."
            class="w-full h-10"
          />
        </div>
      </div>

      <!-- جدول الاستوديوهات -->
      <div class="relative flex-1 border rounded-xl border-sidebar-border/70">
        <Table>
          <TableCaption>قائمة جميع الاستوديوهات</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[50px]">ID</TableHead>
              <TableHead>المستخدم</TableHead>
              <TableHead>اسم الاستوديو (عربي)</TableHead>
              <TableHead>اسم الاستوديو (إنجليزي)</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead class="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="studio in studios" :key="studio.id">
              <TableCell class="font-medium">{{ studio.id }}</TableCell>

              <!-- عرض صورة واسم المستخدم -->
              <TableCell>
                <div class="flex items-center gap-2">
                  <img 
                    :src="studio.user?.avatar ? `/storage/${studio.user.avatar}` : '/default-avatar.png'" 
                    alt="avatar" class="object-cover w-10 h-10 rounded-full" 
                  />
                  <span>{{ studio.user?.name || 'N/A' }}</span>
                </div>
              </TableCell>

              <TableCell>{{ studio.name }}</TableCell>
              <TableCell>{{ studio.name_en }}</TableCell>
              <TableCell>{{ studio.slug }}</TableCell>
              <TableCell>
                <span v-if="studio.date">{{ new Date(studio.date).toLocaleDateString('ar-EG') }}</span>
                <span v-else class="text-gray-400">-</span>
              </TableCell>
              <TableCell>
                <span v-if="studio.is_active" class="font-medium text-green-500">مفعل</span>
                <span v-else class="font-medium text-red-500">غير مفعل</span>
              </TableCell>
              <TableCell class="flex justify-end gap-2">
                <Link 
                  v-if="canStudio('update-studio')" 
                  :href="`/web-settings/studios/${studio.id}/edit`" 
                  class="text-indigo-500 hover:text-indigo-600"
                >
                  تعديل
                </Link>

                <button
                  v-if="canStudio('delete-studio')"
                  @click="deleteStudio(studio.id)" 
                  class="text-red-500 hover:text-red-600"
                >
                  حذف
                </button>
              </TableCell>
            </TableRow>

            <TableRow v-if="studios.length === 0 && !loadingSkeleton">
              <TableCell colspan="8" class="py-4 text-center text-gray-500">
                لا توجد استوديوهات تطابق البحث
              </TableCell>
            </TableRow>

            <!-- Loader -->
            <TableRow v-if="loadingSkeleton">
              <TableCell colspan="8" class="py-6">
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
          لا توجد بيانات إضافية
        </div>
      </div>
    </div>
  </AppLayout>
</template>

