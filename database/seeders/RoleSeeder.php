<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // تحقق إن الدور موجود بالفعل
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // جلب جميع الصلاحيات
        $permissions = Permission::all();

        // ربط جميع الصلاحيات بدور الـ admin
        $adminRole->syncPermissions($permissions);

        $this->command->info('Admin role created with all permissions.');

        // إنشاء دور Admin Assistant (بدون صلاحيات تلقائية)
        $assistantAdminRole = Role::firstOrCreate(['name' => 'Admin Assistant']);
        
        $this->command->info('Admin Assistant role created (without automatic permissions).');
    }
}
