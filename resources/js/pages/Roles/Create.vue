<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { Head, Link, useForm, usePage } from '@inertiajs/vue3'
import { ref, onMounted, watch, computed } from 'vue'
import { toast } from 'vue-sonner'

// UI components
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import InputError from '@/components/InputError.vue'

interface Permission { id: number; name: string }

const props = defineProps<{ permissions: Permission[] }>()

const form = useForm({
  name: '',
  permissions: [] as number[]
})

const showModal = ref(false)
const search = ref('')

const filteredPermissions = computed(() =>
  props.permissions.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()))
)

function togglePermission(id: number) {
  form.permissions.includes(id)
    ? form.permissions = form.permissions.filter(x => x !== id)
    : form.permissions.push(id)
}

function selectAll() { form.permissions = props.permissions.map(p => p.id) }
function clearAll() { form.permissions = [] }

function savePermissions() { showModal.value = false }

const submit = () => form.post(route('roles.store'))

onMounted(() => {
  watch(() => usePage().props.flash, (flash) => {
    if (flash?.success) toast.success(flash.success)
  }, { immediate: true })
})
</script>

<template>
<Head title="إضافة دور" />

<AppLayout>
  <div class="flex flex-col flex-1 p-4">
    <div class="w-full max-w-lg p-6 mx-auto mt-8 bg-white shadow-lg min-w-md dark:bg-neutral-800 rounded-xl">

      <h2 class="mb-6 text-xl font-bold text-center text-gray-900 dark:text-gray-100">
        إضافة دور جديد
      </h2>

      <form @submit.prevent="submit" class="flex flex-col gap-6">
        
        <!-- اسم الدور -->
        <div class="grid gap-2">
          <Label>اسم الدور</Label>
          <Input v-model="form.name" placeholder="مثال: admin أو editor" required />
          <InputError :message="form.errors.name" />
        </div>

        <!-- الصلاحيات -->
        <div class="grid gap-2">
          <Label>الصلاحيات</Label>
          <Button type="button" variant="outline" @click="showModal = true">
            اختر الصلاحيات ({{ form.permissions.length }})
          </Button>

          <div class="flex flex-wrap gap-1 mt-1">
            <span 
              v-for="pid in form.permissions" 
              :key="pid"
              class="px-2 py-1 text-xs bg-gray-200 rounded dark:bg-gray-700"
            >
              {{ props.permissions.find(p => p.id === pid)?.name }}
            </span>
          </div>

          <InputError :message="form.errors.permissions" />
        </div>

        <div class="flex justify-between mt-4">
          <Link href="/roles" class="text-gray-500 hover:underline">
            عودة
          </Link>
          
          <Button type="submit" :disabled="form.processing">
            حفظ
          </Button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal -->
  <div 
    v-if="showModal" 
    @click.self="showModal = false"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div class="w-full max-w-md p-5 bg-white shadow-xl dark:bg-neutral-900 rounded-xl">

      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">اختيار الصلاحيات</h3>
        <button @click="showModal = false" class="text-lg font-bold">✕</button>
      </div>

      <Input v-model="search" placeholder="بحث عن صلاحية..." class="mb-2" />

      <div class="flex gap-2 mb-2">
        <Button variant="outline" class="text-xs" @click="selectAll">تحديد الكل</Button>
        <Button variant="outline" class="text-xs" @click="clearAll">إزالة الكل</Button>
      </div>

      <div class="p-2 space-y-2 overflow-y-auto border rounded max-h-64">
        <label v-for="p in filteredPermissions" :key="p.id" class="flex items-center gap-2 text-sm">
          <input type="checkbox" :checked="form.permissions.includes(p.id)" @change="togglePermission(p.id)" />
          {{ p.name }}
        </label>
      </div>

      <Button @click="savePermissions" class="w-full mt-4">
        موافق
      </Button>
    </div>
  </div>
</AppLayout>
</template>
