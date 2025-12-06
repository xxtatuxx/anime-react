<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { Head, useForm, usePage } from '@inertiajs/vue3';
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

const page = usePage<{ category: any }>();
const category = page.props.category;

const breadcrumbs = [
  { title: 'Categories', href: '/categories' },
  { title: `Edit: ${category.name}`, href: `/categories/${category.id}/edit` },
];

const form = useForm<CategoryForm>({
  name: category.name,
  name_en: category.name_en,
  slug: category.slug,
  description: category.description,
  status: category.status,
});

const submit = () => {
  form.put(route('categories.update', category.id));
};
</script>

<template>
  <Head :title="`Edit Category - ${category.name}`" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">
      <div class="p-6 mx-auto mt-8 bg-white shadow-lg min-w-md dark:bg-neutral-800 rounded-xl">
        <form @submit.prevent="submit" class="flex flex-col gap-6">
          <div class="grid gap-6">

            <!-- Name Arabic -->
            <div class="grid gap-2">
              <Label for="name">Name (Arabic)</Label>
              <Input id="name" type="text" autofocus :tabindex="1" v-model="form.name" />
              <InputError :message="form.errors.name" />
            </div>

            <!-- Name English -->
            <div class="grid gap-2">
              <Label for="name_en">Name (English)</Label>
              <Input id="name_en" type="text" :tabindex="2" v-model="form.name_en" />
              <InputError :message="form.errors.name_en" />
            </div>

            <!-- Slug -->
            <div class="grid gap-2">
              <Label for="slug">Slug</Label>
              <Input id="slug" type="text" :tabindex="3" v-model="form.slug" />
              <InputError :message="form.errors.slug" />
            </div>

            <!-- Description -->
            <div class="grid gap-2">
              <Label for="description">Description</Label>
              <Textarea id="description" :tabindex="4" v-model="form.description" />
              <InputError :message="form.errors.description" />
            </div>

            <!-- Status -->
            <div class="grid gap-2">
              <Label for="status">Status</Label>
              <select id="status" v-model="form.status" :tabindex="5" class="w-full px-3 py-2 border rounded">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <InputError :message="form.errors.status" />
            </div>

            <!-- Submit Button -->
            <Button type="submit" class="w-full mt-4" :tabindex="6" :disabled="form.processing">
              <LoaderCircle v-if="form.processing" class="w-4 h-4 animate-spin" />
              Save Changes
            </Button>

          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>
