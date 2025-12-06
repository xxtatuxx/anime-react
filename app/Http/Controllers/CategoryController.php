<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    // ✅ عرض صفحة index الخاصة بالتصنيفات
public function index()
{
   
    // جلب التصنيفات مع بيانات المستخدم مع ترتيب الأحدث أولاً
    $categories = Category::with('user')->latest()->paginate(9); // يمكنك تغيير 10 لأي عدد تريد

    // إرجاع البيانات مع Inertia
    return Inertia::render('Categories/Index', [
        'categories' => $categories,
    ]);
}



    // ✅ صفحة إنشاء تصنيف جديد
    public function create()
    {
        return Inertia::render('Categories/Create');
    }

    // ✅ حفظ تصنيف جديد
public function store(Request $request)
{
    $data = $request->validate([
        'name' => 'required|string|max:255',
        'name_en' => 'nullable|string|max:255',
        'slug' => 'nullable|string|max:255',
        'description' => 'nullable|string',
        'status' => 'nullable|in:active,inactive',
    ]);

    $data['user_id'] = auth()->id(); // ربط التصنيف بالمستخدم الحالي

    Category::create($data);

    return redirect()->route('categories.index')->with('success', 'تم إنشاء التصنيف بنجاح');
}


    // ✅ صفحة تعديل
    public function edit(Category $category)
    {
        return Inertia::render('Categories/Edit', [
            'category' => $category,
        ]);
    }

    // ✅ تحديث التصنيف
  public function update(Request $request, Category $category)
{
    $data = $request->validate([
        'name' => 'required|string|max:255',
        'name_en' => 'nullable|string|max:255',
        'slug' => 'nullable|string|max:255',
        'description' => 'nullable|string',
        'status' => 'nullable|in:active,inactive',
    ]);

    $data['user_id'] = auth()->id(); // تحديث صاحب التصنيف عند التعديل

    $category->update($data);

    return redirect()->route('categories.index')->with('success', 'تم تحديث التصنيف بنجاح');
}

    // ✅ حذف التصنيف
    public function destroy(Category $category)
    {
        $category->delete();
        return redirect()->back()
            ->with('success', 'تم حذف التصنيف بنجاح');
    }
}
