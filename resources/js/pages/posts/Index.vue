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
import { Post, type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router as inertia } from '@inertiajs/vue3';
import { ref, watch, onMounted } from 'vue';
import { toast } from 'vue-sonner'
import { Input } from '@/components/ui/input'
import Fuse from 'fuse.js'
import { useAuth } from '@/composables/useAuth'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Moves + series', href: '/posts' },
];

const page = usePage<{ posts: Post[], flash?: { success?: string }, auth: { user: any } }>()
const allPosts = page.props.posts

const posts = ref(allPosts)
const search = ref('')

// إعداد Fuse.js للبحث الذكي
const fuse = new Fuse(allPosts, {
  keys: ['title'],
  includeScore: true,
  threshold: 0.4,
  distance: 100,
})

// البحث التلقائي
watch(search, (value) => {
  if (!value) {
    posts.value = allPosts
  } else {
    posts.value = fuse.search(value).map(r => r.item)
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

// دالة canPost للتحقق من صلاحية البوست أو دور الأدمن أو صلاحية موروثة من الدور
const canPost = (action: 'create-post' | 'update-post' | 'delete-post') => {
  const user = page.props.auth.user

  if (can('admin')) return true
  if (can(action)) return true

  const userRoles = user.roles || []
  for (const role of userRoles) {
    if (role.permissions?.includes(action)) return true
  }

  return false
}

// ✅ دالة حذف البوست بدون تحديث الصفحة
const deletePost = (id: number) => {
  inertia.delete(route('posts.destroy', id), {
    onSuccess: () => {
      posts.value = posts.value.filter(p => p.id !== id)
      toast.success('تم حذف البوست بنجاح')
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحذف')
    }
  })
}
</script>

<template>
  <Head title="moves + series" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">

      <!-- زر إضافة + مربع البحث -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Link 
          v-if="canPost('create-post')" 
          href="/posts/create" 
          class="font-medium text-indigo-500 hover:text-indigo-600"
        >
          + Add moves + series
        </Link>

        <div class="flex w-full gap-2 md:w-1/3">
          <Input
            v-model="search"
            placeholder="Search posts..."
            class="w-full h-10"
          />
        </div>
      </div>

      <!-- جدول البوستات -->
      <div class="relative min-h-[100vh] flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border md:min-h-min">
        <Table>
          <TableCaption>A list of your recent posts.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[100px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Image</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="post in posts" :key="post.id">
              <TableCell class="font-medium">{{ post.id }}</TableCell>
              <TableCell>{{ post.title }}</TableCell>
              <TableCell>
                <img :src="post.image" alt="" class="object-cover w-12 h-12 rounded">
              </TableCell>
              <TableCell class="flex justify-end gap-2">
                <Link 
                  v-if="canPost('update-post')" 
                  :href="route('posts.edit', post.id)" 
                  class="text-indigo-500 hover:text-indigo-600"
                >
                  Edit
                </Link>
                <!-- زر حذف بدون تحديث الصفحة -->
                <button
                  v-if="canPost('delete-post')"
                  @click="deletePost(post.id)"
                  class="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </TableCell>
            </TableRow>

            <TableRow v-if="posts.length === 0">
              <TableCell colspan="4" class="py-4 text-center text-gray-500">
                No posts match your search
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </AppLayout>
</template>
