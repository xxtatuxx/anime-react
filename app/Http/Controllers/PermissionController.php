<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
  public function index(Request $request)
{
    $search = $request->input('search');

    $permissions = Permission::query()
        ->when($search, function($query, $search) {
            $words = preg_split('/\s+/', $search); // نفصل البحث لكلمات
            foreach ($words as $word) {
                $query->where('name', 'like', "%{$word}%");
            }
        })
        ->orderBy('id')
        ->get();

    return Inertia::render('Permissions/Index', [
        'permissions' => $permissions,
        'filters' => [
            'search' => $search
        ],
    ]);
}


    public function create()
    {
        return Inertia::render('Permissions/Create');
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|unique:permissions']);
        Permission::create(['name' => $request->name]);
        return redirect()->route('permissions.index')->with('success', 'تمت إضافة الصلاحية بنجاح');
    }

    public function edit(Permission $permission)
    {
        return Inertia::render('Permissions/Edit', ['permission' => $permission]);
    }

    public function update(Request $request, Permission $permission)
    {
        $request->validate(['name' => 'required|unique:permissions,name,' . $permission->id]);
        $permission->update(['name' => $request->name]);
        return redirect()->route('permissions.index')->with('success', 'تم التحديث بنجاح');
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();
        return redirect()->back()->with('success', 'تم حذف الصلاحية');
    }
}
