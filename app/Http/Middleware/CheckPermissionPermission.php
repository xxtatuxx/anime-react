<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermissionPermission
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('admin')) {
            return redirect('/')->with('error', 'ليس لديك صلاحية الوصول للصلاحيات');
        }
        return $next($request);
    }
}
