<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Notifications\NewChatNotification;

class PushSubscriptionController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'user_id' => 'required',
            'subscription' => 'required|array',
            'subscription.endpoint' => 'required|url',
        ]);

        $sub = $request->subscription;

        DB::table('push_subscriptions')->updateOrInsert(
            ['endpoint' => $sub['endpoint']],
            [
                'user_id' => $request->user_id,
                'public_key' => $sub['keys']['p256dh'] ?? null,
                'auth_token' => $sub['keys']['auth'] ?? null,
                'content_encoding' => 'aesgcm', // Default for modern browsers
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return response()->json(['success' => true]);
    }

    public function notify(Request $request)
    {
        $request->validate([
            'receiverName' => 'required',
            'text' => 'required',
            'senderName' => 'required',
        ]);

        $receiver = \App\Models\User::whereRaw('LOWER(name) = ?', [strtolower($request->receiverName)])->first();
        if (!$receiver)
            return response()->json(['success' => false, 'message' => 'Receiver not found'], 404);

        // Kirim riil menggunakan package WebPush
        try {
            $receiver->notify(new NewChatNotification($request->all()));
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
