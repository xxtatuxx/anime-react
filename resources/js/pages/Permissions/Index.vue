<script setup lang="ts">
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import AppLayout from '@/layouts/AppLayout.vue'
import { Head, Link, usePage, router as inertia } from '@inertiajs/vue3'
import { ref, watch } from 'vue'
import Fuse from 'fuse.js'
import { Input } from '@/components/ui/input'
import { toast } from 'vue-sonner' // لإظهار الرسائل

interface Permission {
  id: number
  name: string
}

const page = usePage<{ permissions: Permission[], flash?: { success?: string | null } }>()
const allPermissions = page.props.permissions

const search = ref('')
const results = ref(allPermissions)

// إعداد Fuse.js للبحث الذكي
const fuse = new Fuse(allPermissions, {
  keys: ['name'],
  includeScore: true,
  threshold: 0.4,
  distance: 100,
})

watch(search, (value) => {
  if (!value) {
    results.value = allPermissions
  } else {
    results.value = fuse.search(value).map(r => r.item)
  }
})

// ✅ Flash message تظهر مرة واحدة فقط
watch(
  () => page.props.flash?.success,
  (success) => {
    if (success) {
      toast.success(success)
      page.props.flash.success = null
    }
  },
  { immediate: true }
)

// ✅ دالة حذف الصلاحية بدون تحديث الصفحة
const deletePermission = (id:number) => {
  inertia.delete(route('permissions.destroy', id), {
    onSuccess: () => {
      results.value = results.value.filter(p => p.id !== id)
      toast.success('تم حذف الصلاحية بنجاح')
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحذف')
    }
  })
}
</script>

<template>
  <Head title="الصلاحيات" />
  <AppLayout>
    <div class="flex flex-col h-full gap-4 p-4 rounded-xl">

      <!-- إضافة صلاحية + مربع البحث -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Link href="/permissions/create" class="font-medium text-indigo-600 hover:underline">
          + إضافة صلاحية
        </Link>

        <div class="flex w-full gap-2 md:w-1/3">
          <Input
            v-model="search"
            placeholder="ابحث عن صلاحية..."
            class="w-full h-10"
          />
        </div>
      </div>

      <!-- جدول الصلاحيات -->
      <div class="relative flex-1 min-h-[60vh] rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-2">
        <Table>
          <TableCaption>قائمة الصلاحيات</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead class="w-[80px]">#</TableHead>
              <TableHead>اسم الصلاحية</TableHead>
              <TableHead class="text-right">التحكم</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-for="permission in results" :key="permission.id">
              <TableCell>{{ permission.id }}</TableCell>
              <TableCell>{{ permission.name }}</TableCell>
              <TableCell class="flex justify-end gap-2">
                <Link :href="route('permissions.edit', permission.id)" class="text-indigo-500 hover:text-indigo-600">
                  تعديل
                </Link>

                <!-- زر الحذف بدون تحديث الصفحة -->
                <button
                  @click="deletePermission(permission.id)"
                  class="text-red-500 hover:text-red-600"
                >
                  حذف
                </button>
              </TableCell>
            </TableRow>

            <TableRow v-if="results.length === 0">
              <TableCell colspan="3" class="py-4 text-center text-gray-500">
                لا توجد صلاحيات مطابقة للبحث
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </AppLayout>
</template>
