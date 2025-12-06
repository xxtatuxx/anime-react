<?php

namespace App\Http\Controllers\WebSetting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Language;
use Inertia\Inertia;

class LanguageController extends Controller
{
    public function index(Request $request)
    {
        $languages = Language::with('user')
            ->orderBy('id', 'desc')
            ->simplePaginate(10);

        return Inertia::render('WebSettings/Languages/Index', [
            'languages' => $languages
        ]);
    }

    // صفحة إنشاء لغة جديدة
    public function create()
    {
        return Inertia::render('WebSettings/Languages/Create');
    }

    // حفظ لغة جديدة مع تسجيل المستخدم الحالي
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:languages,slug',
            'date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        Language::create([
            'name' => $data['name'],
            'name_en' => $data['name_en'] ?? '',
            'slug' => $data['slug'],
            'date' => $data['date'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('web-settings.languages.index')
                         ->with('success', 'تم إنشاء اللغة بنجاح');
    }

    // صفحة تعديل اللغة
    public function edit(Language $language)
    {
        return Inertia::render('WebSettings/Languages/Edit', [
            'language' => $language->load('user')
        ]);
    }

    // تحديث اللغة مع تسجيل المستخدم الحالي
    public function update(Request $request, Language $language)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'slug' => "required|string|max:255|unique:languages,slug,{$language->id}",
            'date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $language->update([
            'name' => $data['name'],
            'name_en' => $data['name_en'] ?? '',
            'slug' => $data['slug'],
            'date' => $data['date'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('web-settings.languages.index')
                         ->with('success', 'تم تحديث اللغة بنجاح');
    }

    // حذف اللغة
    public function destroy(Language $language)
    {
        $language->delete();
        return back()->with('success', 'تم حذف اللغة بنجاح');
    }
}
