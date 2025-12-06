<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
   public function index()
{
    return Inertia::render('Users/Index', [
        'users' => User::with('roles', 'permissions')->get(),
        'authUser' => auth()->user()->load('roles', 'permissions'),
    ]);
}


    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::all(),
            'permissions' => Permission::all()
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'roles' => 'array',
            'roles.*' => 'exists:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'avatar' => $data['avatar'] ?? null,
        ]);

        $user->syncRoles($data['roles'] ?? []);
        $user->syncPermissions($data['permissions'] ?? []);

        return redirect()->route('users.index')->with('success', 'تمت إضافة المستخدم بنجاح');
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', [
            'user' => $user->load('roles', 'permissions'),
            'roles' => Role::all(),
            'permissions' => Permission::all()
        ]);
    }

 public function update(Request $request, User $user)
{
    $data = $request->validate([
        'name' => 'required',
        'email' => 'required|email|unique:users,email,' . $user->id,
        'password' => 'nullable|min:6',
        'roles' => 'array',
        'roles.*' => 'exists:roles,name',
        'permissions' => 'array',
        'permissions.*' => 'exists:permissions,name',
        'avatar' => 'nullable|image|max:2048',
    ]);

    $userData = [
        'name' => $data['name'],
        'email' => $data['email'],
    ];

    // كلمة المرور
    if (!empty($data['password'])) {
        $userData['password'] = bcrypt($data['password']);
    }

    // الصورة
    if ($request->hasFile('avatar')) {
        // احذف القديمة فقط إذا كانت موجودة
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }
        $userData['avatar'] = $request->file('avatar')->store('avatars', 'public');
    }

    $user->update($userData);

    // مزامنة الأدوار والصلاحيات
    $user->syncRoles($data['roles'] ?? []);
    $user->syncPermissions($data['permissions'] ?? []);

    return to_route('users.index')->with('success', 'تم تعديل المستخدم بنجاح');
}

    public function destroy(User $user)
    {
        if ($user->avatar) Storage::disk('public')->delete($user->avatar);
        $user->delete();
        return redirect()->back()->with('success', 'تم حذف المستخدم');
    }
}
