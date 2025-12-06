<?php

namespace App\Http\Controllers\WebSetting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Studio;
use Inertia\Inertia;

class StudioController extends Controller
{
    public function index(Request $request)
    {
        $studios = Studio::with('user')
            ->orderBy('id', 'desc')
            ->simplePaginate(10);

        return Inertia::render('WebSettings/Studios/Index', [
            'studios' => $studios
        ]);
    }

    // صفحة إنشاء استوديو جديد
    public function create()
    {
        return Inertia::render('WebSettings/Studios/Create');
    }

    // حفظ استوديو جديد مع تسجيل المستخدم الحالي
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:studios,slug',
            'date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        Studio::create([
            'name' => $data['name'],
            'name_en' => $data['name_en'] ?? '',
            'slug' => $data['slug'],
            'date' => $data['date'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('web-settings.studios.index')
                         ->with('success', 'تم إنشاء الاستوديو بنجاح');
    }

    // صفحة تعديل الاستوديو
    public function edit(Studio $studio)
    {
        return Inertia::render('WebSettings/Studios/Edit', [
            'studio' => $studio->load('user')
        ]);
    }

    // تحديث الاستوديو مع تسجيل المستخدم الحالي
    public function update(Request $request, Studio $studio)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'slug' => "required|string|max:255|unique:studios,slug,{$studio->id}",
            'date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $studio->update([
            'name' => $data['name'],
            'name_en' => $data['name_en'] ?? '',
            'slug' => $data['slug'],
            'date' => $data['date'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('web-settings.studios.index')
                         ->with('success', 'تم تحديث الاستوديو بنجاح');
    }

    // حذف الاستوديو
    public function destroy(Studio $studio)
    {
        $studio->delete();
        return back()->with('success', 'تم حذف الاستوديو بنجاح');
    }
}
