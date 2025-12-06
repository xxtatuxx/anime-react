<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { Head, useForm, usePage } from '@inertiajs/vue3';
import { ref, computed, onMounted, watch } from 'vue';
import { toast } from 'vue-sonner';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import InputError from '@/components/InputError.vue';

const props = defineProps<{
  roles: { id: number; name: string }[],
  permissions: { id: number; name: string }[],
}>();

const form = useForm({
  name: '',
  email: '',
  password: '',
  roles: [],
  permissions: [],
  avatar: null,
});

const imagePreview = ref<string | null>(null);

// Modals
const showRolesModal = ref(false);
const showPermissionsModal = ref(false);
const tempRoles = ref<string[]>([]);
const tempPermissions = ref<string[]>([]);

// Search in modals
const rolesSearch = ref('');
const permissionsSearch = ref('');
const filteredRoles = computed(() => props.roles.filter(r => r.name.toLowerCase().includes(rolesSearch.value.toLowerCase())));
const filteredPermissions = computed(() => props.permissions.filter(p => p.name.toLowerCase().includes(permissionsSearch.value.toLowerCase())));

// Submit
const submit = () => {
  const data = new FormData();
  data.append('name', form.name);
  data.append('email', form.email);
  data.append('password', form.password);
  form.roles.forEach(r => data.append('roles[]', r));
  form.permissions.forEach(p => data.append('permissions[]', p));
  if(form.avatar) data.append('avatar', form.avatar);

  form.post(route('users.store'), { forceFormData: true, onSuccess: () => toast.success('تم إضافة المستخدم بنجاح') });
};

// Image input
const handleImageInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if(file){
    form.avatar = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

// Modal actions
const openRolesModal = () => { tempRoles.value = [...form.roles]; showRolesModal.value = true; }
const openPermissionsModal = () => { tempPermissions.value = [...form.permissions]; showPermissionsModal.value = true; }
const confirmRoles = () => { form.roles = [...tempRoles.value]; showRolesModal.value = false; }
const confirmPermissions = () => { form.permissions = [...tempPermissions.value]; showPermissionsModal.value = false; }
const selectAllRoles = () => tempRoles.value = props.roles.map(r => r.name);
const deselectAllRoles = () => tempRoles.value = [];
const selectAllPermissions = () => tempPermissions.value = props.permissions.map(p => p.name);
const deselectAllPermissions = () => tempPermissions.value = [];
</script>

<template>
<Head title="إضافة مستخدم" />
<AppLayout>
<div class="flex flex-col flex-1 h-full gap-4 p-4">
  <div class="max-w-xl p-6 mx-auto mt-8 bg-white shadow-lg dark:bg-neutral-900 rounded-xl">
    <form @submit.prevent="submit" class="flex flex-col gap-6">
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="name">اسم المستخدم</Label>
          <Input id="name" type="text" v-model="form.name" placeholder="اسم المستخدم" autofocus />
          <InputError :message="form.errors.name" />
        </div>

        <div class="grid gap-2">
          <Label for="email">الإيميل</Label>
          <Input id="email" type="email" v-model="form.email" placeholder="user@example.com" />
          <InputError :message="form.errors.email" />
        </div>

        <div class="grid gap-2">
          <Label for="password">كلمة المرور</Label>
          <Input id="password" type="password" v-model="form.password" placeholder="كلمة المرور" />
          <InputError :message="form.errors.password" />
        </div>

        <div class="grid gap-2">
          <Label for="avatar">الصورة الشخصية</Label>
          <Input id="avatar" type="file" @change="handleImageInput" />
          <img v-if="imagePreview" :src="imagePreview" class="object-cover w-16 h-16 rounded-full" />
          <InputError :message="form.errors.avatar" />
        </div>

        <div class="grid gap-2">
          <Label>الأدوار</Label>
          <Button type="button" @click="openRolesModal">اختيار الأدوار ({{ form.roles.length }})</Button>
        </div>

        <div class="grid gap-2">
          <Label>الصلاحيات</Label>
          <Button type="button" @click="openPermissionsModal">اختيار الصلاحيات ({{ form.permissions.length }})</Button>
        </div>

        <Button type="submit" class="w-full mt-4" :disabled="form.processing">حفظ</Button>
      </div>
    </form>
  </div>
</div>

<!-- Roles Modal -->
<div v-if="showRolesModal" @click.self="showRolesModal = false" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div class="p-4 rounded-lg w-96 max-h-[80vh] overflow-auto bg-white dark:bg-neutral-800 transform transition-transform duration-300 scale-90" :class="showRolesModal ? 'scale-100' : 'scale-90'">
    <h3 class="mb-2 text-lg font-bold">الأدوار</h3>
    <Input v-model="rolesSearch" placeholder="بحث..." />
    <div class="flex gap-2 mb-2">
      <Button @click="selectAllRoles">تحديد الكل</Button>
      <Button @click="deselectAllRoles">إزالة الكل</Button>
    </div>
    <div class="grid grid-cols-1 gap-1">
      <label v-for="role in filteredRoles" :key="role.id" class="flex items-center gap-2">
        <input type="checkbox" :value="role.name" v-model="tempRoles" />
        {{ role.name }}
      </label>
    </div>
    <div class="flex justify-end gap-2 mt-4">
      <Button @click="showRolesModal = false" variant="outline">إلغاء</Button>
      <Button @click="confirmRoles">موافق</Button>
    </div>
  </div>
</div>

<!-- Permissions Modal -->
<div v-if="showPermissionsModal" @click.self="showPermissionsModal = false" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div class="p-4 rounded-lg w-96 max-h-[80vh] overflow-auto bg-white dark:bg-neutral-800 transform transition-transform duration-300 scale-90" :class="showPermissionsModal ? 'scale-100' : 'scale-90'">
    <h3 class="mb-2 text-lg font-bold">الصلاحيات</h3>
    <Input v-model="permissionsSearch" placeholder="بحث..." />
    <div class="flex gap-2 mb-2">
      <Button @click="selectAllPermissions">تحديد الكل</Button>
      <Button @click="deselectAllPermissions">إزالة الكل</Button>
    </div>
    <div class="grid grid-cols-1 gap-1">
      <label v-for="permission in filteredPermissions" :key="permission.id" class="flex items-center gap-2">
        <input type="checkbox" :value="permission.name" v-model="tempPermissions" />
        {{ permission.name }}
      </label>
    </div>
    <div class="flex justify-end gap-2 mt-4">
      <Button @click="showPermissionsModal = false" variant="outline">إلغاء</Button>
      <Button @click="confirmPermissions">موافق</Button>
    </div>
  </div>
</div>

</AppLayout>
</template>
