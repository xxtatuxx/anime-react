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
  { title: 'Types', href: '/web-settings/types' },
];

const page = usePage<{ types: any, flash?: { success?: string }, auth: { user: any } }>();

// البيانات الأساسية
const types = ref([...page.props.types.data]); // دمج البيانات الحالية
const allTypes = ref([...page.props.types.data]); // نسخة للاستخدام في البحث
const nextPageUrl = ref(page.props.types.next_page_url);
const search = ref('');
const loading = ref(false);
const loadingSkeleton = ref(false); // للتحكم بعرض الـ loader

// إعداد Fuse.js للبحث الذكي
let fuse = new Fuse(allTypes.value, {
  keys: ['type', 'name_en', 'user.name'],
  includeScore: true,
  threshold: 0.4,
  distance: 100,
});

// البحث التلقائي أثناء الكتابة
watch(search, (value) => {
  if (!value) {
    types.value = [...allTypes.value]; // إعادة البيانات المجمعة
  } else {
    types.value = fuse.search(value).map(r => r.item);
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
const canType = (action: 'create-type' | 'update-type' | 'delete-type') => {
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
const deleteType = (id: number) => {
  if (!confirm('هل أنت متأكد من حذف هذا النوع؟')) return;

  inertia.delete(`/web-settings/types/${id}`, {
    onSuccess: () => {
      types.value = types.value.filter(t => t.id !== id);
      allTypes.value = allTypes.value.filter(t => t.id !== id);
      toast.success('تم حذف النوع بنجاح');
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
    replace: true, // يحافظ على الرابط في المتصفح ثابت
    only: ['types'], // جلب البيانات فقط بدون إعادة تحميل الصفحة كلها
    onSuccess: (pageResponse) => {
      const newData = pageResponse.props.types.data;

      // دمج البيانات الجديدة بدون تكرار
      const existingIds = new Set(types.value.map(t => t.id));
      const filteredData = newData.filter(t => !existingIds.has(t.id));
      types.value.push(...filteredData);
      allTypes.value.push(...filteredData);

      nextPageUrl.value = pageResponse.props.types.next_page_url;

      fuse = new Fuse(types.value, {
        keys: ['type', 'name_en', 'user.name'],
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
  <Head title="Types" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">

      <!-- زر إضافة + مربع البحث -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Link 
          v-if="canType('create-type')" 
          href="/web-settings/types/create" 
          class="font-medium text-indigo-500 hover:text-indigo-600"
        >
          + Create Type
        </Link>

        <div class="flex w-full gap-2 md:w-1/3">
          <Input
            v-model="search"
            placeholder="Search types..."
            class="w-full h-10"
          />
        </div>
      </div>

      <!-- جدول الأنواع -->
      <div class="relative flex-1 border rounded-xl border-sidebar-border/70">
        <Table>
          <TableCaption>List of all types.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[50px]">ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Name (EN)</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Active</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="type in types" :key="type.id">
              <TableCell class="font-medium">{{ type.id }}</TableCell>

              <!-- عرض صورة واسم المستخدم -->
              <TableCell>
                <div class="flex items-center gap-2">
                  <img 
                    :src="type.user?.avatar ? `/storage/${type.user.avatar}` : '/default-avatar.png'" 
                    alt="avatar" class="object-cover w-10 h-10 rounded-full" 
                  />
                  <span>{{ type.user?.name || 'N/A' }}</span>
                </div>
              </TableCell>

              <TableCell>{{ type.type }}</TableCell>
              <TableCell>{{ type.name_en }}</TableCell>
              <TableCell>{{ type.slug }}</TableCell>
              <TableCell>
                <span v-if="type.is_active" class="font-medium text-green-500">Active</span>
                <span v-else class="font-medium text-red-500">Inactive</span>
              </TableCell>
              <TableCell class="flex justify-end gap-2">
                <Link 
                  v-if="canType('update-type')" 
                  :href="`/web-settings/types/${type.id}/edit`" 
                  class="text-indigo-500 hover:text-indigo-600"
                >
                  Edit
                </Link>

                <button
                  v-if="canType('delete-type')"
                  @click="deleteType(type.id)" 
                  class="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </TableCell>
            </TableRow>

            <TableRow v-if="types.length === 0 && !loadingSkeleton">
              <TableCell colspan="7" class="py-4 text-center text-gray-500">
                No types match your search
              </TableCell>
            </TableRow>

            <!-- Loader -->
            <TableRow v-if="loadingSkeleton">
              <TableCell colspan="7" class="py-6">
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
