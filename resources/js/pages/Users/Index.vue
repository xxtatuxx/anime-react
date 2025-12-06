<script setup lang="ts">
import { Head, Link, usePage, router as inertia } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'vue-sonner'
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Fuse from 'fuse.js'
import { Input } from '@/components/ui/input'

const page = usePage<{ flash: { success?: string | null }, auth: any }>()

interface Role { id:number; name:string }
interface Permission { id:number; name:string }
interface User { id:number; name:string; email:string; avatar?:string; roles:Role[]; permissions:Permission[] }

const props = defineProps<{ users: User[] }>()
const breadcrumbs = [{ title: 'المستخدمون', href: '/users' }]
const { can } = useAuth()

// ref لتتبع ما إذا تم عرض الفلاش
const flashShown = ref(false)

// عرض رسالة الفلاش مرة واحدة فقط
watch(
  () => page.props.flash?.success,
  (success) => {
    if (success && !flashShown.value) {
      toast.success(success)
      flashShown.value = true

      // ✅ امسح الفلاش حتى لا يظهر مره ثانية
      page.props.flash.success = null
    }
  },
  { immediate: true }
)

// -----------------
// بحث ذكي fuzzy search
// -----------------
const search = ref('')
const allUsers = props.users
const filteredUsers = ref(allUsers)

// إعداد Fuse.js للبحث الذكي على الاسم والبريد
const fuse = new Fuse(allUsers, {
  keys: ['name', 'email'],
  includeScore: true,
  threshold: 0.4,  // درجة السماح بالأخطاء
  distance: 100
})

// البحث التلقائي أثناء الكتابة
watch(search, (value) => {
  if (!value) {
    filteredUsers.value = allUsers
  } else {
    filteredUsers.value = fuse.search(value).map(r => r.item)
  }
})

// ✅ حذف المستخدم بدون تحديث الصفحة
const deleteUser = (id:number) => {
  inertia.delete(route('users.destroy', id), {
    onSuccess: () => {
      filteredUsers.value = filteredUsers.value.filter(u => u.id !== id)
      toast.success('تم حذف المستخدم بنجاح')
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحذف')
    }
  })
}
</script>

<template>
  <Head title="المستخدمون" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex flex-col h-full gap-4 p-4 rounded-xl">
      
      <!-- زر إضافة مستخدم + مربع البحث -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            v-if="can('admin') || can('create-user')"
            href="/users/create"
            class="text-indigo-500 hover:text-indigo-600"
          >
            إضافة مستخدم
          </Link>
        </div>

        <div class="flex w-full gap-2 md:w-1/3">
          <Input
            v-model="search"
            placeholder="ابحث عن المستخدم..."
            class="w-full h-10"
          />
        </div>
      </div>

      <!-- معلومات المستخدم الحالي -->
      <div class="flex flex-col items-center justify-between gap-4 p-4 mb-4 border border-gray-200 md:flex-row bg-gray-50 dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div class="flex items-center gap-4">
          <!-- صورة المستخدم -->
          <img :src="page.props.auth.user.avatar ? `/storage/${page.props.auth.user.avatar}` : '/default-avatar.png'" alt="avatar" class="object-cover w-16 h-16 rounded-full" />
          
          <!-- الاسم والإيميل -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ page.props.auth.user.name }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ page.props.auth.user.email }}</p>
          </div>
        </div>

        <!-- الأدوار -->
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="(role, index) in page.props.auth.user.roles" 
            :key="index" 
            class="px-2 py-1 text-xs bg-blue-100 rounded dark:bg-blue-900 dark:text-white"
          >
            {{ role.name }}
          </span>
        </div>

        <!-- الصلاحيات -->
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="(perm, index) in page.props.auth.user.permissions" 
            :key="index" 
            class="px-2 py-1 text-xs bg-green-100 rounded dark:bg-green-900 dark:text-white"
          >
            {{ perm.name }}
          </span>
        </div>
      </div>

      <!-- جدول المستخدمين -->
      <div class="relative min-h-[100vh] flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border md:min-h-min">
        <Table>
          <TableCaption>قائمة المستخدمين</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[50px]">#</TableHead>
              <TableHead>الصورة</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>الإيميل</TableHead>
              <TableHead>الأدوار</TableHead>
              <TableHead>الصلاحيات</TableHead>
              <TableHead class="text-right">التحكم</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in filteredUsers" :key="user.id">
              <TableCell>{{ user.id }}</TableCell>
              <TableCell>
                <img :src="user.avatar ? `/storage/${user.avatar}` : '/default-avatar.png'" alt="avatar" class="object-cover w-10 h-10 rounded-full" />
              </TableCell>
              <TableCell>{{ user.name }}</TableCell>
              <TableCell>{{ user.email }}</TableCell>
              <TableCell>
                <span v-for="role in user.roles" :key="role.id" class="inline-block px-2 py-1 mb-1 mr-1 text-xs bg-gray-200 rounded dark:bg-gray-700">
                  {{ role.name }}
                </span>
              </TableCell>
              <TableCell>
                <span v-for="p in user.permissions" :key="p.id" class="inline-block px-2 py-1 mb-1 mr-1 text-xs bg-gray-200 rounded dark:bg-gray-700">
                  {{ p.name }}
                </span>
              </TableCell>
              <TableCell class="flex justify-end gap-2">
                <Link
                  v-if="can('admin')"
                  :href="route('users.edit', user.id)"
                  class="text-indigo-500 hover:text-indigo-600"
                >تعديل</Link>

                <!-- ✅ زر حذف يعمل بدون تحديث الصفحة -->
                <button
                  v-if="can('admin') || can('delete-user')"
                  @click="deleteUser(user.id)"
                  class="text-red-500 hover:text-red-600"
                >حذف</button>
              </TableCell>
            </TableRow>

            <TableRow v-if="filteredUsers.length === 0">
              <TableCell colspan="7" class="py-4 text-center text-gray-500">
                لا توجد مستخدمين مطابقين للبحث
              </TableCell>
            </TableRow>

          </TableBody>
        </Table>
      </div>
    </div>
  </AppLayout>
</template>
