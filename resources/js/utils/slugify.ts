export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // استبدال الفراغات بشرطة
        .replace(/[^\w\-]+/g, '')       // إزالة الرموز غير الصالحة
        .replace(/\-\-+/g, '-');        // إزالة الشرطات المكررة
}
