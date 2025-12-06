<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { Head, Link, useForm } from '@inertiajs/vue3'
import InputError from '@/components/InputError.vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { watch, onMounted } from 'vue'

const props = defineProps<{ permission: { id: number, name: string } }>()

const form = useForm({ name: props.permission.name })

const submit = () => form.put(route('permissions.update', props.permission.id))

onMounted(() => {
  watch(() => form.recentlySuccessful, (ok) => {
    if (ok) toast.success("تم تحديث الصلاحية بنجاح ✅")
  })
})
</script>

<template>
  <Head title="تعديل صلاحية" />

  <AppLayout>
    <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">
      <div class="p-6 mx-auto mt-8 bg-white shadow-lg min-w-md dark:bg-neutral-800 rounded-xl">

        <h2 class="mb-6 text-xl font-semibold">تعديل الصلاحية</h2>

        <form @submit.prevent="submit" class="flex flex-col gap-6">

          <!-- Input -->
          <div class="grid gap-2">
            <Label for="name">اسم الصلاحية</Label>
            <Input
              id="name"
              type="text"
              v-model="form.name"
              placeholder="مثال: manage-users"
              autofocus
            />
            <InputError :message="form.errors.name" />
          </div>

          <!-- Buttons -->
          <div class="flex justify-between pt-3">
            <Link href="/permissions" class="text-gray-600 hover:text-gray-800">
              عودة
            </Link>

            <Button type="submit" :disabled="form.processing">
              حفظ التغييرات
            </Button>
          </div>

        </form>

      </div>
    </div>
  </AppLayout>
</template>
