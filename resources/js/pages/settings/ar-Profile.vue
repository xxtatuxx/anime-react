<script setup lang="ts">
import { TransitionRoot, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { Head, useForm, usePage } from '@inertiajs/vue3';
import { ref, watch, onMounted, nextTick, computed } from 'vue';
import { toast } from 'vue-sonner';

import DeleteUser from '@/components/DeleteUser.vue';
import HeadingSmall from '@/components/HeadingSmall.vue';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AR-HomeLayout.vue';
import SettingsLayout from '@/layouts/settings/ar-Layout.vue';
import type { BreadcrumbItem, SharedData, User } from '@/types';

interface RoleProp { id: number; name: string; }
interface PermissionProp { id: number; name: string; }

interface Props {
  mustVerifyEmail: boolean;
  status?: string;
  roles: RoleProp[];
  permissions: PermissionProp[];
}

const props = defineProps<Props>();

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Profile settings', href: '/ar/settings/profile' },
];

// Current user
const page = usePage<SharedData>();
const user = page.props.auth.user as User;

// Form
const form = useForm({
  name: user.name,
  email: user.email,
  password: '',
  avatar: null,
  roles: user.roles.map(r => r.name),
  permissions: user.permissions.map(p => p.name),
  _method: 'patch',
});

// Loading states
const pageLoaded = ref(false);
const imageLoaded = ref(false);

// Image preview with lazy loading
const imagePreview = ref<string | null>(user.avatar ? `/storage/${user.avatar}` : null);

const handleImageInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    form.avatar = file;
    imageLoaded.value = false;
    imagePreview.value = URL.createObjectURL(file);
  }
};

// Handle image load
const handleImageLoad = () => {
  imageLoaded.value = true;
};

// Handle image error
const handleImageError = () => {
  imageLoaded.value = true;
};

// Modals
const showRolesModal = ref(false);
const showPermissionsModal = ref(false);
const tempRoles = ref([...form.roles]);
const tempPermissions = ref([...form.permissions]);

// Search functionality
const rolesSearchQuery = ref('');
const permissionsSearchQuery = ref('');

// Filtered lists based on search
const filteredRoles = computed(() => {
  if (!rolesSearchQuery.value) return props.roles;
  return props.roles.filter(role => 
    role.name.toLowerCase().includes(rolesSearchQuery.value.toLowerCase())
  );
});

const filteredPermissions = computed(() => {
  if (!permissionsSearchQuery.value) return props.permissions;
  return props.permissions.filter(permission => 
    permission.name.toLowerCase().includes(permissionsSearchQuery.value.toLowerCase())
  );
});

const openRolesModal = () => { 
  tempRoles.value = [...form.roles]; 
  rolesSearchQuery.value = '';
  showRolesModal.value = true; 
};

const openPermissionsModal = () => { 
  tempPermissions.value = [...form.permissions]; 
  permissionsSearchQuery.value = '';
  showPermissionsModal.value = true; 
};

const confirmRoles = () => { 
  form.roles = [...tempRoles.value]; 
  showRolesModal.value = false; 
};

const confirmPermissions = () => { 
  form.permissions = [...tempPermissions.value]; 
  showPermissionsModal.value = false; 
};

const selectAllRoles = () => tempRoles.value = filteredRoles.value.map(r => r.name);
const deselectAllRoles = () => tempRoles.value = [];
const selectAllPermissions = () => tempPermissions.value = filteredPermissions.value.map(p => p.name);
const deselectAllPermissions = () => tempPermissions.value = [];

// Initialize page
onMounted(() => {
  pageLoaded.value = true;
  if (imagePreview.value && !form.avatar) {
    imageLoaded.value = true;
  }

  watch(() => usePage().props.flash, (flash) => {
    if (flash?.success) toast.success(flash.success);
  }, { immediate: true });
});

// Submit form
const submit = () => {
  const data = new FormData();
  data.append('name', form.name);
  data.append('email', form.email);
  if (form.password) data.append('password', form.password);
  form.roles.forEach(r => data.append('roles[]', r));
  form.permissions.forEach(p => data.append('permissions[]', p));
  if (form.avatar) data.append('avatar', form.avatar);

  form.post(route('ar.profile.update'), {
    data,
    preserveScroll: true,
    preserveState: true,
    onSuccess: (page) => {
      toast.success('تم تعديل البيانات بنجاح');
      const newAvatar = form.avatar ? URL.createObjectURL(form.avatar) : page.props.auth.user.avatar;
      page.props.auth.user.avatar = newAvatar;
      
       setTimeout(() => {
        window.location.reload();
      }, 1);
    },

    
  });
};
</script>

<template>
<AppLayout :breadcrumbs="breadcrumbs">
  <Head title="إعدادات الملف الشخصي" />
  <SettingsLayout>
    <!-- المحتوى الرئيسي - بدون تأثير التمرير للأعلى -->
    <div class="flex flex-col space-y-6">
      <HeadingSmall 
        title="معلومات الملف الشخصي" 
        description="قم بتحديث معلومات ملفك الشخصي، الصورة، الأدوار، والصلاحيات" 
      />

      <form @submit.prevent="submit" class="space-y-6" enctype="multipart/form-data">
        <!-- الاسم -->
        <div class="grid gap-2">
          <Label for="name">الاسم</Label>
          <Input 
            id="name" 
            v-model="form.name" 
            required 
            autocomplete="name" 
            placeholder="الاسم الكامل" 
            class="block w-full mt-1" 
          />
          <InputError class="mt-2" :message="form.errors.name" />
        </div>

        <!-- الإيميل -->
        <div class="grid gap-2">
          <Label for="email">البريد الإلكتروني</Label>
          <Input 
            id="email" 
            type="email" 
            v-model="form.email" 
            required 
            autocomplete="username" 
            placeholder="البريد الإلكتروني" 
            class="block w-full mt-1" 
          />
          <InputError class="mt-2" :message="form.errors.email" />
        </div>

        <!-- كلمة المرور -->
        <div class="grid gap-2">
          <Label for="password">كلمة المرور (اختياري)</Label>
          <Input 
            id="password" 
            type="password" 
            v-model="form.password" 
            placeholder="كلمة المرور" 
            class="block w-full mt-1" 
          />
          <InputError class="mt-2" :message="form.errors.password" />
        </div>

        <!-- الصورة مع Lazy Loading -->
        <div class="grid gap-2">
          <Label>صورة الملف الشخصي</Label>
          <input 
            type="file" 
            @change="handleImageInput" 
            class="w-full px-3 py-2 rounded-md dark:border-gray-600 dark:bg-black-500" 
            accept="image/*"
          />
          
          <!-- معاينة الصورة مع Lazy Loading -->
          <div 
            v-if="imagePreview" 
            class="relative mt-2"
          >
            <!-- هيكل التحميل -->
         

            <!-- الصورة الفعلية -->
            <TransitionRoot
              :show="imageLoaded"
              enter="transition-opacity duration-300"
              enter-from="opacity-0"
              enter-to="opacity-100"
              leave="transition-opacity duration-300"
              leave-from="opacity-100"
              leave-to="opacity-0"
            >
              <img 
                :src="imagePreview" 
                @load="handleImageLoad"
                @error="handleImageError"
                class="object-cover w-24 h-24 rounded-full"
                loading="lazy"
                alt="صورة الملف الشخصي"
              />
            </TransitionRoot>
          </div>
          
          <InputError class="mt-2" :message="form.errors.avatar" />
        </div>

        <!-- الأدوار -->
        <div hidden class="mb-4">
          <Label>الأدوار</Label>
          <button 
            type="button" 
            @click="openRolesModal" 
            class="flex items-center gap-2 px-3 py-2 text-gray-900 transition-colors duration-200 bg-gray-100 border rounded dark:bg-primary hover:bg-gray-200 dark:hover:bg-primary"
          >
            تعديل الأدوار
            <span class="flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-500 rounded-full">
              {{ form.roles.length }}
            </span>
          </button>
        </div>

        <!-- الصلاحيات -->
        <div hidden class="mb-4">
          <Label>الصلاحيات</Label>
          <button 
            type="button" 
            @click="openPermissionsModal" 
            class="flex items-center gap-2 px-3 py-2 text-gray-900 transition-colors duration-200 bg-gray-100 border rounded dark:bg-primary hover:bg-gray-200 dark:hover:bg-primary"
          >
            تعديل الصلاحيات
            <span class="flex items-center justify-center w-5 h-5 text-xs text-gray-700 bg-green-500 rounded-full">
              {{ form.permissions.length }}
            </span>
          </button>
        </div>

        <div class="flex items-center gap-4">
          <Button :disabled="form.processing">
            <span v-if="form.processing" class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              جاري الحفظ...
            </span>
            <span v-else>حفظ</span>
          </Button>
          
          <TransitionRoot 
            :show="form.recentlySuccessful" 
            enter="transition-opacity duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="transition-opacity duration-300"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <p class="text-sm font-medium text-green-600 dark:text-green-400">تم الحفظ بنجاح!</p>
          </TransitionRoot>
        </div>
      </form>

      <!-- مودال الأدوار -->
      <Dialog :open="showRolesModal" @close="showRolesModal = false" class="relative z-50">
        <TransitionRoot
          :show="showRolesModal"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/50" />
        </TransitionRoot>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex items-center justify-center min-h-full p-4">
            <TransitionRoot
              :show="showRolesModal"
              enter="ease-out duration-300"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl dark:bg-gray-800">
                <!-- رأس المودال -->
                <DialogTitle class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">إدارة الأدوار</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">اختر الأدوار المناسبة للمستخدم</p>
                  </div>
                  <button @click="showRolesModal = false" class="p-1 text-gray-400 transition-colors duration-200 rounded hover:text-gray-600 dark:hover:text-gray-300">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </DialogTitle>

                <!-- مربع البحث -->
                <div class="mb-4">
                  <div class="relative">
                    <input
                      type="text"
                      v-model="rolesSearchQuery"
                      placeholder="ابحث عن الأدوار..."
                      class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- الإجراءات الجماعية -->
                <div class="flex gap-2 mb-4">
                  <button 
                    @click="selectAllRoles" 
                    class="flex-1 px-3 py-2 text-sm font-medium text-blue-600 transition-colors duration-200 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  >
                    تحديد الكل
                  </button>
                  <button 
                    @click="deselectAllRoles" 
                    class="flex-1 px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    إلغاء تحديد الكل
                  </button>
                </div>

                <!-- قائمة الأدوار -->
                <div class="space-y-2 overflow-y-auto max-h-64 custom-scrollbar">
                  <label 
                    v-for="role in filteredRoles" 
                    :key="role.id" 
                    class="flex items-center gap-3 p-3 transition-colors duration-200 border border-gray-200 rounded-lg cursor-pointer dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    :class="{
                      'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-600': tempRoles.includes(role.name)
                    }"
                  >
                    <input 
                      type="checkbox" 
                      :value="role.name" 
                      v-model="tempRoles"
                      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ role.name }}</span>
                  </label>
                  
                  <div v-if="filteredRoles.length === 0" class="py-4 text-center text-gray-500 dark:text-gray-400">
                    لا توجد نتائج للبحث
                  </div>
                </div>

                <!-- تذييل المودال -->
                <div class="flex gap-2 mt-6">
                  <button 
                    @click="showRolesModal = false" 
                    class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    إلغاء
                  </button>
                  <button 
                    @click="confirmRoles" 
                    class="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    تأكيد
                  </button>
                </div>
              </DialogPanel>
            </TransitionRoot>
          </div>
        </div>
      </Dialog>

      <!-- مودال الصلاحيات الفرعية -->
      <Dialog :open="showPermissionsModal" @close="showPermissionsModal = false" class="relative z-50">
        <TransitionRoot
          :show="showPermissionsModal"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/50" />
        </TransitionRoot>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex items-center justify-center min-h-full p-4">
            <TransitionRoot
              :show="showPermissionsModal"
              enter="ease-out duration-300"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl dark:bg-gray-800">
                <!-- رأس المودال -->
                <DialogTitle class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">إدارة الصلاحيات الفرعية</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">اختر الصلاحيات التفصيلية للمستخدم</p>
                  </div>
                  <button @click="showPermissionsModal = false" class="p-1 text-gray-400 transition-colors duration-200 rounded hover:text-gray-600 dark:hover:text-gray-300">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </DialogTitle>

                <!-- مربع البحث -->
                <div class="mb-4">
                  <div class="relative">
                    <input
                      type="text"
                      v-model="permissionsSearchQuery"
                      placeholder="ابحث عن الصلاحيات الفرعية..."
                      class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- الإجراءات الجماعية -->
                <div class="flex gap-2 mb-4">
                  <button 
                    @click="selectAllPermissions" 
                    class="flex-1 px-3 py-2 text-sm font-medium text-green-600 transition-colors duration-200 border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/30"
                  >
                    تحديد الكل
                  </button>
                  <button 
                    @click="deselectAllPermissions" 
                    class="flex-1 px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    إلغاء تحديد الكل
                  </button>
                </div>

                <!-- قائمة الصلاحيات -->
                <div class="space-y-2 overflow-y-auto max-h-64 custom-scrollbar">
                  <label 
                    v-for="permission in filteredPermissions" 
                    :key="permission.id" 
                    class="flex items-center gap-3 p-3 transition-colors duration-200 border border-gray-200 rounded-lg cursor-pointer dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    :class="{
                      'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-600': tempPermissions.includes(permission.name)
                    }"
                  >
                    <input 
                      type="checkbox" 
                      :value="permission.name" 
                      v-model="tempPermissions"
                      class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ permission.name }}</span>
                  </label>
                  
                  <div v-if="filteredPermissions.length === 0" class="py-4 text-center text-gray-500 dark:text-gray-400">
                    لا توجد نتائج للبحث
                  </div>
                </div>

                <!-- تذييل المودال -->
                <div class="flex gap-2 mt-6">
                  <button 
                    @click="showPermissionsModal = false" 
                    class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    إلغاء
                  </button>
                  <button 
                    @click="confirmPermissions" 
                    class="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    تأكيد
                  </button>
                </div>
              </DialogPanel>
            </TransitionRoot>
          </div>
        </div>
      </Dialog>

      <DeleteUser />
    </div>
  </SettingsLayout>
</AppLayout>

</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: #1e293b;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>