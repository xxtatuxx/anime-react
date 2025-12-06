<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * API endpoint for dropdown
     */
    public function index()
    {
        $user = Auth::user();
        
        $notifications = $user->notifications()->latest()->take(20)->get();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications->count(),
        ]);
    }

    /**
     * Full page view with pagination
     */
    public function page()
    {
        $user = Auth::user();
        
        $notifications = $user->notifications()->latest()->paginate(20);

        return \Inertia\Inertia::render('home/NotificationsPage', [
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications->count(),
        ]);
    }

    public function markAsRead()
    {
        Auth::user()->unreadNotifications->markAsRead();
        return response()->json(['status' => 'success']);
    }

    public function destroy($id)
    {
        try {
            $notification = Auth::user()->notifications()->findOrFail($id);
            $notification->delete();
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function clearAll()
    {
        Auth::user()->notifications()->delete();
        return response()->json(['status' => 'success']);
    }
}
