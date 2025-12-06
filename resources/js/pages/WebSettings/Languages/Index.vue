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
  { title: 'Languages', href: '/web-settings/languages' },
];

const page = usePage<{ languages: any, flash?: { success?: string }, auth: { user: any } }>();

// البيانات الأساسية
const languages = ref([...page.props.languages.data]);
const allLanguages = ref([...page.props.languages.data]);
const nextPageUrl = ref(page.props.languages.next_page_url);
const search = ref('');
const loading = ref(false);
const loadingSkeleton = ref(false);

// إعداد Fuse.js للبحث الذكي
let fuse = new Fuse(allLanguages.value, {
  keys: ['name', 'name_en', 'date', 'user.name'],
  includeScore: true,
  threshold: 0.4,
  distance: 100,
});

// البحث التلقائي أثناء الكتابة
watch(search, (value) => {
  if (!value) {
    languages.value = [...allLanguages.value];
  } else {
    languages.value = fuse.search(value).map(r => r.item);
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
const canLanguage = (action: 'create-language' | 'update-language' | 'delete-language') => {
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
const deleteLanguage = (id: number) => {
  if (!confirm('هل أنت متأكد من حذف هذه اللغة؟')) return;

  inertia.delete(`/web-settings/languages/${id}`, {
    onSuccess: () => {
      languages.value = languages.value.filter(l => l.id !== id);
      allLanguages.value = allLanguages.value.filter(l => l.id !== id);
      toast.success('تم حذف اللغة بنجاح');
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
    only: ['languages'],
    onSuccess: (pageResponse) => {
      const newData = pageResponse.props.languages.data;

      const existingIds = new Set(languages.value.map(l => l.id));
      const filteredData = newData.filter(l => !existingIds.has(l.id));
      languages.value.push(...filteredData);
      allLanguages.value.push(...filteredData);

      nextPageUrl.value = pageResponse.props.languages.next_page_url;

      fuse = new Fuse(languages.value, {
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
  <Head title="Languages" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">

      <!-- زر إضافة + مربع البحث -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Link 
          v-if="canLanguage('create-language')" 
          href="/web-settings/languages/create" 
          class="font-medium text-indigo-500 hover:text-indigo-600"
        >
          + إنشاء لغة
        </Link>

        <div class="flex w-full gap-2 md:w-1/3">
          <Input
            v-model="search"
            placeholder="البحث في اللغات..."
            class="w-full h-10"
          />
        </div>
      </div>

      <!-- جدول اللغات -->
      <div class="relative flex-1 border rounded-xl border-sidebar-border/70">
        <Table>
          <TableCaption>قائمة جميع اللغات</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[50px]">ID</TableHead>
              <TableHead>المستخدم</TableHead>
              <TableHead>اسم اللغة (عربي)</TableHead>
              <TableHead>اسم اللغة (إنجليزي)</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead class="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="language in languages" :key="language.id">
              <TableCell class="font-medium">{{ language.id }}</TableCell>

              <!-- عرض صورة واسم المستخدم -->
              <TableCell>
                <div class="flex items-center gap-2">
                  <img 
                    :src="language.user?.avatar ? `/storage/${language.user.avatar}` : '/default-avatar.png'" 
                    alt="avatar" class="object-cover w-10 h-10 rounded-full" 
                  />
                  <span>{{ language.user?.name || 'N/A' }}</span>
                </div>
              </TableCell>

              <TableCell>{{ language.name }}</TableCell>
              <TableCell>{{ language.name_en }}</TableCell>
              <TableCell>{{ language.slug }}</TableCell>
              <TableCell>
                <span v-if="language.date">{{ new Date(language.date).toLocaleDateString('ar-EG') }}</span>
                <span v-else class="text-gray-400">-</span>
              </TableCell>
              <TableCell>
                <span v-if="language.is_active" class="font-medium text-green-500">مفعل</span>
                <span v-else class="font-medium text-red-500">غير مفعل</span>
              </TableCell>
              <TableCell class="flex justify-end gap-2">
                <Link 
                  v-if="canLanguage('update-language')" 
                  :href="`/web-settings/languages/${language.id}/edit`" 
                  class="text-indigo-500 hover:text-indigo-600"
                >
                  تعديل
                </Link>

                <button
                  v-if="canLanguage('delete-language')"
                  @click="deleteLanguage(language.id)" 
                  class="text-red-500 hover:text-red-600"
                >
                  حذف
                </button>
              </TableCell>
            </TableRow>

            <TableRow v-if="languages.length === 0 && !loadingSkeleton">
              <TableCell colspan="8" class="py-4 text-center text-gray-500">
                لا توجد لغات تطابق البحث
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


