// composables/useAuth.ts
import { usePage } from '@inertiajs/vue3';

export function useAuth() {
  const page = usePage<{ authUser?: any; auth?: { user?: any } }>();

  const can = (name: string) => {
    // محاولة استخدام authUser أولاً (إذا كان متاحاً)
    const user = page.props.authUser || page.props.auth?.user;
    if (!user) return false;

    const roles = user.roles || [];
    const permissions = user.permissions || [];

    // تحقق إذا الاسم موجود في Roles أو Permissions
    // إذا كانت roles/permissions مصفوفة من الأسماء (strings)
    if (Array.isArray(roles) && roles.length > 0 && typeof roles[0] === 'string') {
      const hasRole = roles.includes(name);
      const hasPermission = permissions.includes(name);
      return hasRole || hasPermission;
    }

    // إذا كانت roles/permissions مصفوفة من الكائنات
    const hasRole = roles.some((r: any) => (typeof r === 'string' ? r === name : r.name === name));
    const hasPermission = permissions.some((p: any) => (typeof p === 'string' ? p === name : p.name === name));

    return hasRole || hasPermission;
  };

  return { can };
}
