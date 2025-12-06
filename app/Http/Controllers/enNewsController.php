<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class enNewsController extends Controller
{
    // عرض كل الأخبار
    public function index()
    {
        $news = News::orderBy('id', 'desc')->get();
        return inertia('home/news', [
            'news' => $news,
        ]);
    }

    // صفحة إنشاء خبر جديد
    public function create()
    {
        return inertia('home/NewsCreate');
    }

    // تخزين الخبر الجديد
    public function store(Request $request)
    {
        $request->validate([
            'title_ar' => 'required|string|max:255',
            'subtitle_ar' => 'nullable|string|max:255',
            'description_ar' => 'nullable|string',
            'link_ar' => 'nullable|url',
            'title_en' => 'required|string|max:255',
            'subtitle_en' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'link' => 'nullable|url',
            'image' => 'nullable|image|max:2048', // دعم رفع صورة
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('news_images', 'public');
        }

        News::create([
            'title_ar' => $request->title_ar,
            'subtitle_ar' => $request->subtitle_ar,
            'description_ar' => $request->description_ar,
            'link_ar' => $request->link_ar,
            'title_en' => $request->title_en,
            'subtitle_en' => $request->subtitle_en,
            'description_en' => $request->description_en,
            'link' => $request->link,
            'image' => $imagePath,
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('news.index')->with('success', 'تم إضافة الخبر بنجاح');
    }

    // عرض صفحة خبر واحد (عرض التفاصيل)
    public function show(News $news)
    {
        return inertia('NewsShow', ['news' => $news]);
    }

    // صفحة تعديل خبر
    public function edit(News $news)
    {
        return inertia('home/NewsEdit', ['currentNews' => $news]);
    }

    // تحديث الخبر
    public function update(Request $request, News $news)
    {
        $request->validate([
            'title_ar' => 'required|string|max:255',
            'subtitle_ar' => 'nullable|string|max:255',
            'description_ar' => 'nullable|string',
            'link_ar' => 'nullable|url',
            'title_en' => 'required|string|max:255',
            'subtitle_en' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'link' => 'nullable|url',
            'image' => 'nullable|image|max:2048', // دعم رفع صورة
        ]);

        // إذا تم رفع صورة جديدة
        if ($request->hasFile('image')) {
            // حذف الصورة القديمة إذا وجدت
            if ($news->image && Storage::disk('public')->exists($news->image)) {
                Storage::disk('public')->delete($news->image);
            }
            $news->image = $request->file('image')->store('news_images', 'public');
        }

        $news->update([
            'title_ar' => $request->title_ar,
            'subtitle_ar' => $request->subtitle_ar,
            'description_ar' => $request->description_ar,
            'link_ar' => $request->link_ar,
            'title_en' => $request->title_en,
            'subtitle_en' => $request->subtitle_en,
            'description_en' => $request->description_en,
            'link' => $request->link,
            'image' => $news->image, // الصورة الجديدة أو القديمة
        ]);

        return redirect()->route('news.index')->with('success', 'تم تحديث الخبر بنجاح');
    }

    // حذف الخبر
    public function destroy(News $news)
    {
        // حذف الصورة من التخزين إذا وجدت
        if ($news->image && Storage::disk('public')->exists($news->image)) {
            Storage::disk('public')->delete($news->image);
        }

        $news->delete();
        return response()->json(['success' => true]);
    }
}
