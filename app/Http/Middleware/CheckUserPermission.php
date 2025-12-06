<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckUserPermission
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('admin')) {
            return redirect('/')->with('error', 'ليس لديك صلاحية الوصول لهذه الصفحة');
        }
        return $next($request);
    }
}
