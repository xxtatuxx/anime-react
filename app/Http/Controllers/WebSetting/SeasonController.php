<?php

namespace App\Http\Controllers\WebSetting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Season;
use Inertia\Inertia;

class SeasonController extends Controller
{
    public function index(Request $request)
    {
        $seasons = Season::with('user')
            ->orderBy('id', 'desc')
            ->simplePaginate(10);

        return Inertia::render('WebSettings/Seasons/Index', [
            'seasons' => $seasons
        ]);
    }

    // صفحة إنشاء سيزون جديد
    public function create()
    {
        return Inertia::render('WebSettings/Seasons/Create');
    }

    // حفظ سيزون جديد مع تسجيل المستخدم الحالي
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:seasons,slug',
            'date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        Season::create([
            'name' => $data['name'],
            'name_en' => $data['name_en'] ?? '',
            'slug' => $data['slug'],
            'date' => $data['date'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('web-settings.seasons.index')
                         ->with('success', 'تم إنشاء السيزون بنجاح');
    }

    // صفحة تعديل السيزون
    public function edit(Season $season)
    {
        return Inertia::render('WebSettings/Seasons/Edit', [
            'season' => $season->load('user')
        ]);
    }

    // تحديث السيزون مع تسجيل المستخدم الحالي
    public function update(Request $request, Season $season)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'slug' => "required|string|max:255|unique:seasons,slug,{$season->id}",
            'date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $season->update([
            'name' => $data['name'],
            'name_en' => $data['name_en'] ?? '',
            'slug' => $data['slug'],
            'date' => $data['date'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('web-settings.seasons.index')
                         ->with('success', 'تم تحديث السيزون بنجاح');
    }

    // حذف السيزون
    public function destroy(Season $season)
    {
        $season->delete();
        return back()->with('success', 'تم حذف السيزون بنجاح');
    }
}
