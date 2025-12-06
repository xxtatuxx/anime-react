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
import AppLayout from '@/layouts/AppLayout.vue'
import { Head, Link, usePage, router as inertia } from '@inertiajs/vue3'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { toast } from 'vue-sonner'
import { Input } from '@/components/ui/input'
import Fuse from 'fuse.js'
import { useAuth } from '@/composables/useAuth'

const breadcrumbs = [{ title: 'التصنيفات', href: '/categories' }]

// بيانات الصفحة
const page = usePage<{ categories: any, flash?: { success?: string }, auth: { user: any } }>()
const categories = ref([...page.props.categories.data])
const allCategories = ref([...page.props.categories.data])
const nextPageUrl = ref(page.props.categories.next_page_url)

const search = ref('')
const loading = ref(false)
const loadingSkeleton = ref(false)

// إعداد Fuse.js للبحث الذكي
let fuse = new Fuse(allCategories.value, {
  keys: ['name', 'name_en', 'slug', 'status', 'user.name'],
  includeScore: true,
  threshold: 0.4,
  distance: 100,
})

// البحث التلقائي أثناء الكتابة
watch(search, (value) => {
  if (!value) {
    categories.value = [...allCategories.value]
  } else {
    categories.value = fuse.search(value).map(r => r.item)
  }
})

// Flash messages
onMounted(() => {
  if (page.props.flash?.success) {
    toast.success(page.props.flash.success)
    page.props.flash.success = null
  }

  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

// الصلاحيات
const { can } = useAuth()
const canCategory = (action: 'create-category' | 'update-category' | 'delete-category') => {
  const user = page.props.auth.user
  if (can('admin')) return true
  if (can(action)) return true
  const roles = user.roles || []
  return roles.some(role => role.permissions?.includes(action))
}

// حذف التصنيف بدون إعادة تحميل الصفحة
const deleteCategory = (id: number) => {
  if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

  inertia.delete(route('categories.destroy', id), {
    onSuccess: () => {
      categories.value = categories.value.filter(c => c.id !== id)
      allCategories.value = allCategories.value.filter(c => c.id !== id)
      toast.success('تم حذف التصنيف بنجاح')
      fuse = new Fuse(allCategories.value, {
        keys: ['name', 'name_en', 'slug', 'status', 'user.name'],
        includeScore: true,
        threshold: 0.4,
        distance: 100,
      })
    },
    onError: () => toast.error('حدث خطأ أثناء الحذف'),
  })
}

// جلب الصفحة التالية مع Loader Skeleton
const loadMore = () => {
  if (!nextPageUrl.value || loading.value) return

  loading.value = true
  loadingSkeleton.value = true

  inertia.get(nextPageUrl.value, {}, {
    preserveScroll: true,
    preserveState: true,
    replace: true,
    only: ['categories'],
    onSuccess: (pageResponse) => {
      const newData = pageResponse.props.categories.data

      // دمج البيانات بدون تكرار
      const existingIds = new Set(categories.value.map(c => c.id))
      const filteredData = newData.filter(c => !existingIds.has(c.id))
      categories.value.push(...filteredData)
      allCategories.value.push(...filteredData)

      nextPageUrl.value = pageResponse.props.categories.next_page_url

      // إعادة تهيئة Fuse
      fuse = new Fuse(allCategories.value, {
        keys: ['name', 'name_en', 'slug', 'status', 'user.name'],
        includeScore: true,
        threshold: 0.4,
        distance: 100,
      })
    },
    onFinish: () => {
      loading.value = false
      loadingSkeleton.value = false
    },
  })
}

// مراقبة التمرير
const onScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY
  const bottom = document.documentElement.offsetHeight - 50
  if (scrollPosition >= bottom) {
    loadMore()
  }
}
</script>

<template>
  <Head title="التصنيفات" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">

      <!-- زر الإضافة + البحث -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Link
          v-if="canCategory('create-category')"
          href="/categories/create"
          class="font-medium text-indigo-500 hover:text-indigo-600"
        >
          + إضافة تصنيف جديد
        </Link>

        <div class="flex w-full gap-2 md:w-1/3">
          <Input
            v-model="search"
            placeholder="ابحث عن تصنيف..."
            class="w-full h-10"
          />
        </div>
      </div>

      <!-- جدول التصنيفات -->
      <div class="relative flex-1 min-h-[100vh] rounded-xl border border-sidebar-border/70 dark:border-sidebar-border md:min-h-min">
        <Table>
          <TableCaption>قائمة التصنيفات</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[80px]">ID</TableHead>
              <TableHead>المستخدم</TableHead>
              <TableHead>الاسم (عربي)</TableHead>
              <TableHead>الاسم (إنجليزي)</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead class="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="cat in categories" :key="cat.id">
              <TableCell>{{ cat.id }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <img
                    :src="cat.user?.avatar ? `/storage/${cat.user.avatar}` : '/default-avatar.png'"
                    alt="avatar"
                    class="object-cover w-10 h-10 rounded-full"
                  />
                  <span>{{ cat.user?.name || 'N/A' }}</span>
                </div>
              </TableCell>
              <TableCell>{{ cat.name }}</TableCell>
              <TableCell>{{ cat.name_en }}</TableCell>
              <TableCell>{{ cat.slug }}</TableCell>
              <TableCell>
                <span :class="cat.status === 'active' ? 'text-green-600' : 'text-gray-400'">
                  {{ cat.status === 'active' ? 'نشط' : 'غير نشط' }}
                </span>
              </TableCell>
              <TableCell class="flex justify-end gap-2">
                <Link
                  v-if="canCategory('update-category')"
                  :href="route('categories.edit', cat.id)"
                  class="text-indigo-500 hover:text-indigo-600"
                >
                  تعديل
                </Link>
                <button
                  v-if="canCategory('delete-category')"
                  @click="deleteCategory(cat.id)"
                  class="text-red-500 hover:text-red-600"
                >
                  حذف
                </button>
              </TableCell>
            </TableRow>

            <!-- Loader Skeleton -->
            <TableRow v-if="loadingSkeleton">
              <TableCell colspan="7" class="py-6">
              <div class="flex justify-center w-full">
  <div role="status" class="w-full max-w-full space-y-4 animate-pulse flex flex-col items-center">
    <div class="w-2/3 h-4 bg-gray-200 rounded-full dark:bg-gray-700"></div>
    <div class="w-5/6 h-4 bg-gray-200 rounded-full dark:bg-gray-700"></div>
    <div class="w-3/4 h-4 bg-gray-200 rounded-full dark:bg-gray-700"></div>
    <!-- السبان في الوسط -->
    <span class="loader mt-4"></span>
  </div>
</div>

              </TableCell>
            </TableRow>

            <TableRow v-if="categories.length === 0 && !loadingSkeleton">
              <TableCell colspan="7" class="py-4 text-center text-gray-500">
                لا توجد تصنيفات مطابقة للبحث
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </AppLayout>
</template>

<style> 


.loader {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: inline-block;
  border-top: 4px solid #FFF;
  border-right: 4px solid transparent;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}
.loader::after {
  content: '';  
  box-sizing: border-box;
  position: absolute;
  left: 0;
  top: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border-left: 4px solid #FF3D00;
  border-bottom: 4px solid transparent;
  animation: rotation 0.5s linear infinite reverse;
}
@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
} 


</style>