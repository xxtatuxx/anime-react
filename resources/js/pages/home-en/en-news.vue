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
import { Head, Link, usePage, router as inertia } from '@inertiajs/vue3';
import { ref, watch, onMounted } from 'vue';
import { toast } from 'vue-sonner'
import { Input } from '@/components/ui/input'
import Fuse from 'fuse.js'
import { useAuth } from '@/composables/useAuth'

interface NewsItem {
  id: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  link_ar?: string;
  link?: string;
  image?: string;
  user?: any;
}

const breadcrumbs = [
    { title: 'News', href: '/news' },
];

const page = usePage<{ news: NewsItem[], flash?: { success?: string }, auth: { user: any } }>()
const allNews = page.props.news

const news = ref(allNews)
const search = ref('')

// إعداد Fuse.js للبحث الذكي
const fuse = new Fuse(allNews, {
  keys: ['title_ar', 'title_en'],
  includeScore: true,
  threshold: 0.4,
  distance: 100,
})

// البحث التلقائي
watch(search, (value) => {
  if (!value) {
    news.value = allNews
  } else {
    news.value = fuse.search(value).map(r => r.item)
  }
})

// Flash messages تظهر مرة واحدة
onMounted(() => {
  if (page.props.flash?.success) {
    toast.success(page.props.flash.success)
    page.props.flash.success = null
  }
})

// صلاحيات المستخدم
const { can } = useAuth()

const canNews = (action: 'create-news' | 'update-news' | 'delete-news') => {
  const user = page.props.auth.user

  if (can('admin')) return true
  if (can(action)) return true

  const userRoles = user.roles || []
  for (const role of userRoles) {
    if (role.permissions?.includes(action)) return true
  }

  return false
}

// دالة حذف الخبر بدون تحديث الصفحة
const deleteNews = (id: number) => {
  inertia.delete(route('news.destroy', id), {
    onSuccess: () => {
      news.value = news.value.filter(n => n.id !== id)
      toast.success('تم حذف الخبر بنجاح')
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحذف')
    }
  })
}
</script>

<template>
  <Head title="News" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">

      <!-- زر إضافة + مربع البحث -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Link 
          v-if="canNews('create-news')" 
          href="/news/create" 
          class="font-medium text-indigo-500 hover:text-indigo-600"
        >
          + Add News
        </Link>

        <div class="flex w-full gap-2 md:w-1/3">
          <Input
            v-model="search"
            placeholder="Search news..."
            class="w-full h-10"
          />
        </div>
      </div>

      <!-- جدول الأخبار -->
      <div class="relative min-h-[100vh] flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border md:min-h-min">
        <Table>
          <TableCaption>A list of your recent news.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[100px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Link</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="n in news" :key="n.id">
              <TableCell class="font-medium">{{ n.id }}</TableCell>
              <TableCell>{{ n.title_ar }}</TableCell>
              <TableCell>
                <img v-if="n.image" :src="n.image" alt="" class="object-cover w-12 h-12 rounded">
                <span v-else class="text-gray-400">No Image</span>
              </TableCell>
              <TableCell>
                <a v-if="n.link_ar" :href="n.link_ar" target="_blank" class="text-blue-500 hover:underline">
                  Open
                </a>
                <span v-else class="text-gray-400">No Link</span>
              </TableCell>
              <TableCell class="flex justify-end gap-2">
                <Link 
                  v-if="canNews('update-news')" 
                  :href="route('news.edit', n.id)" 
                  class="text-indigo-500 hover:text-indigo-600"
                >
                  Edit
                </Link>
                <button
                  v-if="canNews('delete-news')"
                  @click="deleteNews(n.id)"
                  class="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </TableCell>
            </TableRow>

            <TableRow v-if="news.length === 0">
              <TableCell colspan="5" class="py-4 text-center text-gray-500">
                No news match your search
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

    </div>
  </AppLayout>
</template>
