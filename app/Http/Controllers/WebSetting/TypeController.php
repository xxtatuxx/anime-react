<?php

namespace App\Http\Controllers\WebSetting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Type;
use Inertia\Inertia;

class TypeController extends Controller
{
public function index(Request $request)
{
    sleep(1); // التأخير الاصطناعي
    $types = Type::with('user') // هنا نحمل بيانات المستخدم
        ->orderBy('id', 'desc')
        ->simplePaginate(10);

    return Inertia::render('WebSettings/Types/Index', [
        'types' => $types
    ]);
}

    // صفحة إنشاء نوع جديد
    public function create()
    {
        return Inertia::render('WebSettings/Types/Create');
    }

    // حفظ نوع جديد مع تسجيل المستخدم الحالي
  public function store(Request $request)
{
    $data = $request->validate([
        'type' => 'required|string|max:255',
        'name_en' => 'nullable|string|max:255',
        'slug' => 'required|string|max:255|unique:types,slug',
        'is_active' => 'boolean',
    ]);

    Type::create([
        'type' => $data['type'],
        'name_en' => $data['name_en'] ?? '',
        'slug' => $data['slug'],
        'is_active' => $data['is_active'] ?? true,
        'user_id' => auth()->id(), // تأكد من إضافة هذا السطر
    ]);

    return redirect()->route('web-settings.types.index')
                     ->with('success', 'Type created successfully.');
}
    // صفحة تعديل النوع
    public function edit(Type $type)
    {
        return Inertia::render('WebSettings/Types/Edit', [
            'type' => $type
        ]);
    }

    // تحديث النوع مع تسجيل المستخدم الحالي
    public function update(Request $request, Type $type)
    {
        $data = $request->validate([
            'type' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'slug' => "required|string|max:255|unique:types,slug,{$type->id}",
            'is_active' => 'boolean',
        ]);

        $type->update([
            'type' => $data['type'],
            'name_en' => $data['name_en'] ?? '',
            'slug' => $data['slug'],
            'is_active' => $data['is_active'] ?? true,
            'user_id' => auth()->id(), // حفظ المستخدم الذي عدّل النوع
        ]);

        return redirect()->route('web-settings.types.index')
                         ->with('success', 'Type updated successfully.');
    }

    // حذف النوع
    public function destroy(Type $type)
    {
        $type->delete();
        return back()->with('success', 'Type deleted successfully.');
    }
}
