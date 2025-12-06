<script setup lang="ts">
import { Head, Link, usePage, router as inertia } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useAuth } from '@/composables/useAuth'
import Fuse from 'fuse.js'
import { Input } from '@/components/ui/input'

// -----------------
// استقبال flash من الإضافة (redirect)
// -----------------
const page = usePage<{ flash?: { success?: string | null } }>()
const flashShown = ref(false)

watch(
  () => page.props.flash?.success,
  (success) => {
    if (success && !flashShown.value) {
      toast.success(success)
      flashShown.value = true
      page.props.flash!.success = null
    }
  },
  { immediate: true }
)

// -----------------
// props و auth
// -----------------
interface Permission { id:number; name:string }
interface Role { id:number; name:string; permissions:Permission[] }

const props = defineProps<{ roles: Role[]; allPermissions: Permission[] }>()
const breadcrumbs = [{ title: 'الأدوار', href: '/roles' }]
const { can } = useAuth()

// -----------------
// بحث ذكي fuzzy search
// -----------------
const search = ref('')
const allRoles = props.roles
const filteredRoles = ref(allRoles)

const fuse = new Fuse(allRoles, {
  keys: ['name'],
  includeScore: true,
  threshold: 0.4,
  distance: 100
})

watch(search, (value) => {
  if (!value) filteredRoles.value = allRoles
  else filteredRoles.value = fuse.search(value).map(r => r.item)
})

// -----------------
// حذف بدون تحديث الصفحة
// -----------------
const deleteRole = (id:number) => {
  inertia.delete(route('roles.destroy', id), {
    onSuccess: () => {
      filteredRoles.value = filteredRoles.value.filter(r => r.id !== id)
      toast.success('تم حذف الدور بنجاح')
    },
    onError: () => toast.error('حدث خطأ أثناء الحذف')
  })
}

// -----------------
// تعديل الدور بدون إعادة تحميل الصفحة
// -----------------
const updateRole = (role: Role, newName: string, permissions: number[]) => {
  inertia.put(route('roles.update', role.id), { name: newName, permissions }, {
    onSuccess: () => {
      // تحديث الجدول مباشرة
      role.name = newName
      role.permissions = permissions.map(id => {
        const perm = props.allPermissions.find(p => p.id === id)
        return perm || { id, name: 'غير معروف' }
      })
      toast.success('تم التحديث بنجاح')
    },
    onError: () => toast.error('حدث خطأ أثناء التحديث')
  })
}
</script>

<template>
  <Head title="الأدوار" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex flex-col h-full gap-4 p-4 rounded-xl">

      <!-- زر إضافة دور + مربع البحث -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            v-if="can('admin') || can('create-role')"
            href="/roles/create"
            class="text-indigo-500 hover:text-indigo-600"
          >
            إضافة دور
          </Link>
        </div>

        <div class="flex w-full gap-2 md:w-1/3">
          <Input
            v-model="search"
            placeholder="ابحث عن الدور..."
            class="w-full h-10"
          />
        </div>
      </div>

      <!-- جدول الأدوار -->
      <div class="relative min-h-[60vh] flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border md:min-h-min">
        <Table>
          <TableCaption>قائمة الأدوار والصلاحيات</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead class="w-[80px]">#</TableHead>
              <TableHead>اسم الدور</TableHead>
              <TableHead>الصلاحيات</TableHead>
              <TableHead class="text-right">التحكم</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-for="role in filteredRoles" :key="role.id">
              <TableCell>{{ role.id }}</TableCell>
              <TableCell>{{ role.name }}</TableCell>
              <TableCell class="text-sm">
                <span v-if="role.permissions.length === 0" class="text-gray-400">لا توجد صلاحيات</span>
                <template v-else>
                  <span v-for="p in role.permissions" :key="p.id" class="inline-block px-2 py-1 mb-1 mr-1 text-xs bg-gray-200 rounded dark:bg-gray-700">{{ p.name }}</span>
                </template>
              </TableCell>

              <TableCell class="flex justify-end gap-2">
                <Link
                  v-if="can('admin') || can('update-role')"
                  :href="route('roles.edit', role.id)"
                  class="text-indigo-500 hover:text-indigo-600"
                >
                  تعديل
                </Link>

                <button
                  v-if="can('admin') || can('delete-role')"
                  @click="deleteRole(role.id)"
                  class="text-red-500 hover:text-red-600"
                >
                  حذف
                </button>
              </TableCell>
            </TableRow>

            <TableRow v-if="filteredRoles.length === 0">
              <TableCell colspan="4" class="py-4 text-center text-gray-500">
                لا توجد أدوار مطابقة للبحث
              </TableCell>
            </TableRow>

          </TableBody>
        </Table>
      </div>

    </div>
  </AppLayout>
</template>
