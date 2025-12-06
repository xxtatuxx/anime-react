<script setup lang="ts">
import { Head, Link, useForm, usePage } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ref, onMounted, watch, computed } from 'vue'
import { toast } from 'vue-sonner'

interface Permission { id:number; name:string }
interface Role { id:number; name:string; permissions: Permission[] }
const props = defineProps<{ role: Role, permissions: Permission[] }>()

const form = useForm({
  name: props.role.name,
  permissions: props.role.permissions.map(p=>p.id)
})

const showModal = ref(false)
const search = ref('')
const filteredPermissions = computed(() =>
  props.permissions.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()))
)

function togglePermission(id:number){
  form.permissions.includes(id)
    ? form.permissions = form.permissions.filter(x => x !== id)
    : form.permissions.push(id)
}
function selectAll(){ form.permissions = props.permissions.map(p=>p.id) }
function clearAll(){ form.permissions = [] }
function savePermissions(){ showModal.value = false }

const submit = () => form.put(route('roles.update', props.role.id))

onMounted(() => {
  watch(() => usePage().props.flash, (flash) => {
    if (flash?.success) toast.success(flash.success)
  }, { immediate: true })
})
</script>

<template>
  <Head title="تعديل دور" />

  <AppLayout>
    <div class="relative flex justify-center mt-10">
      <Card class="w-full max-w-lg border shadow-xl dark:bg-neutral-900">
        <CardHeader>
          <CardTitle class="text-xl font-semibold">تعديل دور</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="submit" class="space-y-5">

            <!-- اسم الدور -->
            <div class="space-y-2">
              <Label>اسم الدور</Label>
              <Input v-model="form.name" required placeholder="اكتب اسم الدور" />
            </div>

            <!-- اختيار الصلاحيات -->
            <div class="space-y-2">
              <Label>الصلاحيات</Label>
              <Button @click="showModal = true" type="button" class="w-full">اختر الصلاحيات</Button>

              <div class="flex flex-wrap gap-1 mt-2">
                <span
                  v-for="pid in form.permissions"
                  :key="pid"
                  class="px-2 py-1 text-xs rounded bg-neutral-200 dark:bg-neutral-800"
                >
                  {{ props.permissions.find(p => p.id === pid)?.name }}
                </span>
              </div>
            </div>

            <!-- أزرار -->
            <div class="flex justify-between">
              <Link href="/roles">
                <Button variant="outline">عودة</Button>
              </Link>
              <Button type="submit">حفظ التغييرات</Button>
            </div>

          </form>
        </CardContent>
      </Card>

      <!-- Modal -->
      <div 
        v-if="showModal" 
        @click.self="showModal = false"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <Card class="z-50 w-full max-w-md p-4 space-y-4 shadow-xl dark:bg-neutral-900">
          <div class="flex items-center justify-between">
            <h3 class="font-bold">اختيار الصلاحيات</h3>
            <button @click="showModal = false" class="text-lg">✕</button>
          </div>

          <Input v-model="search" placeholder="بحث عن الصلاحيات..." />

          <div class="flex gap-2">
            <Button variant="secondary" @click="selectAll">تحديد الكل</Button>
            <Button variant="secondary" @click="clearAll">إزالة الكل</Button>
          </div>

          <div class="pr-2 space-y-2 overflow-y-auto max-h-64">
            <label
              v-for="p in filteredPermissions"
              :key="p.id"
              class="flex items-center gap-2 text-sm"
            >
              <input type="checkbox" :checked="form.permissions.includes(p.id)" @change="togglePermission(p.id)" />
              {{ p.name }}
            </label>
          </div>

          <Button class="w-full" @click="savePermissions">تم</Button>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>
