<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Posts permissions
            'create-post',
            'update-post',
            'delete-post',
            'page-post',
            // Types permissions
            'create-type',
            'update-type',
            'delete-type',
            'page-type',
            // Categories permissions
            'page-category',
            // Seasons permissions
            'create-season',
            'update-season',
            'delete-season',
            'page-season',
            // Studios permissions
            'create-studio',
            'update-studio',
            'delete-studio',
            'page-studio',
            // Languages permissions
            'create-language',
            'update-language',
            'delete-language',
            'page-language',
            // Users, Roles, Permissions management
            'manage-users',
            'manage-roles',
            'manage-permissions',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
