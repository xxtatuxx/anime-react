<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // إنشاء أو إيجاد دور الـ admin
        $role = Role::firstOrCreate(['name' => 'admin']);

        // إنشاء المستخدم الجديد
        $user = User::create([
            'name' => 'عبدالرحمن محمد حسن',
            'email' => 'aaaa@gmail.com',
            'password' => bcrypt('aaaa@gmail.com'), // ضع كلمة مرور قوية
        ]);

        // إعطاء الدور للمستخدم
        $user->assignRole($role);
    }
}
