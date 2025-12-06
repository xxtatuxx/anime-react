<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostStoreController extends Controller
{
    /**
     * Handle the incoming request.
     */
public function __invoke(Request $request)
{
    $data = $request->validate([
        'title' => 'required',
        'content' => 'required',
        'images' => 'required|array',
        'images.*' => 'image',
    ]);

    $slug = str($data['title'])->slug();

    if ($request->hasFile('images')) {
        foreach ($request->file('images') as $file) {
            // جلب الاسم الأصلي للملف
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $filename = $originalName . '.' . $extension;

            // حفظ الصورة في مجلد animes
            $path = $file->storeAs('animes', $filename, 'public');

            // إنشاء صف جديد في posts لكل صورة
            $request->user()->posts()->create([
                'title' => $data['title'],
                'content' => $data['content'],
                'slug' => $slug,
                'image' => $path, // تخزين مسار الصورة
            ]);
        }
    }

    return to_route('posts.index')->with('success', 'Posts created successfully with multiple images');
}


}
