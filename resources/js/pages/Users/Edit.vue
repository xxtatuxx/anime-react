<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { Head, Link, useForm, usePage } from '@inertiajs/vue3';
import { ref, computed, watch } from 'vue';
import { toast } from 'vue-sonner';

// UI Components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/InputError.vue';

interface UserProp {
  id: number;
  name: string;
  email: string;
  roles: { name: string }[];
  permissions: { name: string }[];
  avatar?: string | null;
}

interface RoleProp { id: number; name: string; }
interface PermissionProp { id: number; name: string; }

const props = defineProps<{
  user: UserProp;
  roles: RoleProp[];
  permissions: PermissionProp[];
}>();

// Form
const form = useForm({
  name: props.user.name,
  email: props.user.email,
  password: '',
  roles: props.user.roles.map(r => r.name),
  permissions: props.user.permissions.map(p => p.name),
  avatar: null,
  _method: 'put',
});

// Image preview
const imagePreview = ref<string | null>(props.user.avatar ? `/storage/${props.user.avatar}` : null);

// Modals
const showRolesModal = ref(false);
const showPermissionsModal = ref(false);
const tempRoles = ref([...form.roles]);
const tempPermissions = ref([...form.permissions]);

const rolesSearch = ref('');
const permissionsSearch = ref('');

const filteredRoles = computed(() =>
  props.roles.filter(r => r.name.toLowerCase().includes(rolesSearch.value.toLowerCase()))
);

const filteredPermissions = computed(() =>
  props.permissions.filter(p => p.name.toLowerCase().includes(permissionsSearch.value.toLowerCase()))
);

const openRolesModal = () => { tempRoles.value = [...form.roles]; showRolesModal.value = true; };
const openPermissionsModal = () => { tempPermissions.value = [...form.permissions]; showPermissionsModal.value = true; };
const confirmRoles = () => { form.roles = [...tempRoles.value]; showRolesModal.value = false; };
const confirmPermissions = () => { form.permissions = [...tempPermissions.value]; showPermissionsModal.value = false; };
const selectAllRoles = () => tempRoles.value = props.roles.map(r => r.name);
const deselectAllRoles = () => tempRoles.value = [];
const selectAllPermissions = () => tempPermissions.value = props.permissions.map(p => p.name);
const deselectAllPermissions = () => tempPermissions.value = [];

// Handle image input
const handleImageInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    form.avatar = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

// Submit
const submit = () => {
  const data = new FormData();
  data.append('name', form.name);
  data.append('email', form.email);
  if (form.password) data.append('password', form.password);
  form.roles.forEach(r => data.append('roles[]', r));
  form.permissions.forEach(p => data.append('permissions[]', p));
  if (form.avatar) data.append('avatar', form.avatar);
  form.post(route('users.update', props.user.id), {
    data,
    preserveScroll: true,
    onSuccess: () => toast.success('تم تعديل المستخدم بنجاح'),
  });
};

// Flash messages
watch(() => usePage().props.flash, (flash) => {
  if (flash?.success) toast.success(flash.success);
}, { immediate: true });
</script>

<template>
<Head title="تعديل المستخدم" />

<AppLayout>
  <div class="flex flex-col flex-1 p-4">
    <div class="w-full max-w-lg p-6 mx-auto mt-8 bg-white shadow-lg min-w-md dark:bg-neutral-800 rounded-xl">
      <h2 class="mb-6 text-xl font-bold text-center text-gray-900 dark:text-gray-100">تعديل بيانات المستخدم</h2>

      <form @submit.prevent="submit" enctype="multipart/form-data" class="flex flex-col gap-6">

        <!-- الاسم -->
        <div class="grid gap-2">
          <Label>اسم المستخدم</Label>
          <Input v-model="form.name" />
          <InputError :message="form.errors.name" />
        </div>

        <!-- الإيميل -->
        <div class="grid gap-2">
          <Label>الإيميل</Label>
          <Input v-model="form.email" type="email"/>
          <InputError :message="form.errors.email" />
        </div>

        <!-- كلمة المرور -->
        <div class="grid gap-2">
          <Label>كلمة المرور (اختياري)</Label>
          <Input v-model="form.password" type="password"/>
          <InputError :message="form.errors.password" />
        </div>

        <!-- صورة -->
        <div class="grid gap-2">
          <Label>الصورة الشخصية</Label>
          <Input type="file" @change="handleImageInput" />
          <img v-if="imagePreview" :src="imagePreview" class="object-cover w-16 h-16 mt-2 rounded-full" />
          <InputError :message="form.errors.avatar" />
        </div>

        <!-- Roles -->
        <div class="grid gap-2">
          <Label>الأدوار</Label>
          <Button type="button" variant="outline" @click="openRolesModal">
            تعديل الأدوار ({{ form.roles.length }})
          </Button>
        </div>

        <!-- Permissions -->
        <div class="grid gap-2">
          <Label>الصلاحيات</Label>
          <Button type="button" variant="outline" @click="openPermissionsModal">
            تعديل الصلاحيات ({{ form.permissions.length }})
          </Button>
        </div>

        <div class="flex justify-between mt-4">
          <Link href="/users" class="text-gray-500 hover:underline">عودة</Link>
          <Button type="submit" :disabled="form.processing">
            حفظ التغييرات
          </Button>
        </div>

      </form>
    </div>
  </div>

  <!-- Roles Modal -->
  <div v-if="showRolesModal" @click.self="showRolesModal = false" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="w-full max-w-md p-5 space-y-4 bg-white shadow-xl dark:bg-neutral-900 rounded-xl">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">تعديل الأدوار</h3>
        <button @click="showRolesModal = false" class="text-lg">✕</button>
      </div>

      <Input v-model="rolesSearch" placeholder="بحث..." class="w-full p-2 border rounded" />

      <div class="flex gap-2">
        <Button variant="outline" @click="selectAllRoles">تحديد الكل</Button>
        <Button variant="outline" @click="deselectAllRoles">إزالة الكل</Button>
      </div>

      <div class="pr-1 space-y-1 overflow-y-auto max-h-64">
        <label v-for="role in filteredRoles" :key="role.id" class="flex items-center gap-2 text-sm">
          <input type="checkbox" :value="role.name" v-model="tempRoles" /> {{ role.name }}
        </label>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <Button variant="outline" @click="showRolesModal = false">إلغاء</Button>
        <Button @click="confirmRoles">موافق</Button>
      </div>
    </div>
  </div>

  <!-- Permissions Modal -->
  <div v-if="showPermissionsModal" @click.self="showPermissionsModal = false" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="w-full max-w-md p-5 space-y-4 bg-white shadow-xl dark:bg-neutral-900 rounded-xl">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">تعديل الصلاحيات</h3>
        <button @click="showPermissionsModal = false" class="text-lg">✕</button>
      </div>

      <Input v-model="permissionsSearch" placeholder="بحث..." class="w-full p-2 border rounded" />

      <div class="flex gap-2">
        <Button variant="outline" @click="selectAllPermissions">تحديد الكل</Button>
        <Button variant="outline" @click="deselectAllPermissions">إزالة الكل</Button>
      </div>

      <div class="pr-1 space-y-1 overflow-y-auto max-h-64">
        <label v-for="permission in filteredPermissions" :key="permission.id" class="flex items-center gap-2 text-sm">
          <input type="checkbox" :value="permission.name" v-model="tempPermissions" /> {{ permission.name }}
        </label>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <Button variant="outline" @click="showPermissionsModal = false">إلغاء</Button>
        <Button @click="confirmPermissions">موافق</Button>
      </div>
    </div>
  </div>
</AppLayout>
</template>
