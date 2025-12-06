<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
      
       $this->call([
    AdminUserSeeder::class,
   RoleSeeder::class,
    
    LanguagesTableSeeder::class,
    TypeSeeder::class,
    SeasonSeeder::class,
    PermissionSeeder::class,
    StudioSeeder::class,     // Seeder الاستوديوهات
    CategorySeeder::class,
    AnimeNarutoSeeder::class,
    AnimeOnePieceSeeder::class,
    
    // Seeder الشونين / الفئات
         ]);

    }
}
