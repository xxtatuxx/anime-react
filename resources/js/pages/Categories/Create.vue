<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { LoaderCircle } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/InputError.vue';

interface CategoryForm {
  name: string;
  name_en: string;
  slug: string;
  description: string;
  status: string;
}

const breadcrumbs = [
  { title: 'Add Category', href: '/categories' },
];

const form = useForm<CategoryForm>({
  name: '',
  name_en: '',
  slug: '',
  description: '',
  status: 'active',
});

const submit = () => {
  // إرسال البيانات للكنترولر
  form.post(route('categories.store'));
};
</script>

<template>
  <Head title="Create Category" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">
      <div class="p-6 mx-auto mt-8 bg-white shadow-lg min-w-md dark:bg-neutral-800 rounded-xl">
        <form @submit.prevent="submit" class="flex flex-col gap-6">
          <div class="grid gap-6">

            <!-- الاسم بالعربية -->
            <div class="grid gap-2">
              <Label for="name">Name (Arabic)</Label>
              <Input
                id="name"
                type="text"
                autofocus
                v-model="form.name"
                placeholder="Enter Arabic name"
              />
              <InputError :message="form.errors.name" />
            </div>

            <!-- الاسم بالإنجليزية -->
            <div class="grid gap-2">
              <Label for="name_en">Name (English)</Label>
              <Input
                id="name_en"
                type="text"
                v-model="form.name_en"
                placeholder="Enter English name"
              />
              <InputError :message="form.errors.name_en" />
            </div>

            <!-- Slug (أي نص حر) -->
            <div class="grid gap-2">
              <Label for="slug">Slug</Label>
              <Input
                id="slug"
                type="text"
                v-model="form.slug"
                placeholder="Enter slug (any text)"
              />
              <InputError :message="form.errors.slug" />
            </div>

            <!-- الوصف -->
            <div class="grid gap-2">
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="form.description"
                placeholder="Enter description"
              />
              <InputError :message="form.errors.description" />
            </div>

            <!-- الحالة -->
            <div class="grid gap-2">
              <Label for="status">Status</Label>
              <select
                id="status"
                v-model="form.status"
                class="w-full px-3 py-2 border rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <InputError :message="form.errors.status" />
            </div>

            <!-- زر الإرسال -->
            <Button type="submit" class="w-full mt-4" :disabled="form.processing">
              <LoaderCircle v-if="form.processing" class="w-4 h-4 animate-spin" />
              Create
            </Button>

          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>
