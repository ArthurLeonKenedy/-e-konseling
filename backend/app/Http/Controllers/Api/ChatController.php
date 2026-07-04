<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Notifications\NewChatNotification;

class ChatController extends Controller
{
    // Ambil riwayat chat antara dua user
    public function index(Request $request)
    {
        // sender_id = user yang sedang login (dari token, tidak bisa dimanipulasi)
        $sender_id   = $request->user()->id;
        $receiver_id = $request->receiver_id;

        if (!$receiver_id) {
            return response()->json(['success' => false, 'message' => 'receiver_id diperlukan'], 422);
        }
        $messagesQuery = Message::where(function($q) use ($sender_id, $receiver_id) {
            $q->where(function($q2) use ($sender_id, $receiver_id) {
                $q2->where('sender_id', $sender_id)->where('receiver_id', $receiver_id);
            })->orWhere(function($q2) use ($sender_id, $receiver_id) {
                $q2->where('sender_id', $receiver_id)->where('receiver_id', $sender_id);
            });
        });

        if ($request->has('after_id')) {
            $messagesQuery->where('id', '>', $request->after_id);
        }

        $messages = $messagesQuery->orderBy('created_at', 'asc')->get();

        return response()->json([
            'success' => true,
            'data'    => $messages
        ]);
    }

    // Simpan pesan baru
    public function store(Request $request)
    {
        $request->validate([
            'sender_id'   => 'required|exists:users,id',
            'receiver_id' => 'required|exists:users,id',
            'message'     => 'required|string|min:1',
        ]);

        $message = Message::create([
            'sender_id'   => $request->sender_id,
            'receiver_id' => $request->receiver_id,
            'message'     => $request->message,
            'is_read'     => false,
        ]);

        // Kirim Notifikasi Push via internal controller call atau broadcast
        try {
            $sender = \App\Models\User::find($request->sender_id);
            $receiver = \App\Models\User::find($request->receiver_id);
            if ($receiver) {
                $receiver->notify(new NewChatNotification([
                    'senderName' => $sender->name,
                    'senderId' => $sender->id,
                    'senderRole' => $sender->role,
                    'text' => $request->message
                ]));
            }
        } catch (\Throwable $e) {
            // Silently fail notification but keep message saved
            \Illuminate\Support\Facades\Log::error('Push Notification Error: ' . $e->getMessage());
        }

        // Broadcast event ke penerima
        broadcast(new \App\Events\MessageSent($message))->toOthers();

        return response()->json([
            'success' => true,
            'data'    => $message
        ]);
    }

    // Mark as read — hanya izinkan user menandai pesannya sendiri
    public function markAsRead(Request $request)
    {
        $receiver_id = $request->user()->id; // Hanya bisa mark as read pesan yang diterima diri sendiri

        $query = Message::where('receiver_id', $receiver_id)
                       ->where('is_read', false);
        
        if ($request->has('sender_id')) {
            $query->where('sender_id', $request->sender_id);
        }

        $query->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    // Ambil jumlah chat belum terbaca — selalu untuk user yang sedang login
    public function getUnreadCounts(Request $request)
    {
        // receiver_id selalu diri sendiri (dari token)
        $receiver_id = $request->user()->id;
        
        $counts = Message::where('receiver_id', $receiver_id)
            ->where('is_read', false)
            ->selectRaw('sender_id, count(*) as total')
            ->groupBy('sender_id')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $counts
        ]);
    }

    // Ambil daftar percakapan (inbox) dengan user unik beserta pesan terakhir
    // OPTIMIZED: Menggunakan satu query + eager loading untuk menghindari N+1 problem
    public function getConversations(Request $request)
    {
        $userId = $request->user()->id;

        // Ambil semua pesan yang melibatkan user ini, eager load sender & receiver sekaligus
        $messages = Message::where('sender_id', $userId)
                        ->orWhere('receiver_id', $userId)
                        ->with(['sender:id,name,role,kelas,photo,last_seen_at',
                                'receiver:id,name,role,kelas,photo,last_seen_at'])
                        ->orderBy('created_at', 'desc')
                        ->get();

        $conversations = [];

        foreach ($messages as $msg) {
            $otherId = $msg->sender_id === $userId ? $msg->receiver_id : $msg->sender_id;

            // Ambil data user dari relasi yang sudah di-eager load (tanpa query tambahan)
            $otherUser = $msg->sender_id === $userId ? $msg->receiver : $msg->sender;

            if (!isset($conversations[$otherId]) && $otherUser) {
                $conversations[$otherId] = [
                    'user' => [
                        'id'           => $otherUser->id,
                        'name'         => $otherUser->name,
                        'role'         => $otherUser->role,
                        'kelas'        => $otherUser->kelas,
                        'photo'        => $otherUser->photo,
                        'last_seen_at' => $otherUser->last_seen_at,
                    ],
                    'latest_message' => [
                        'id'         => $msg->id,
                        'message'    => $msg->message,
                        'created_at' => $msg->created_at,
                        'sender_id'  => $msg->sender_id,
                        'is_read'    => $msg->is_read,
                    ],
                    'unread_count' => 0,
                ];
            }

            // Hitung unread (pesan yang diterima oleh kita dan belum dibaca)
            if ($msg->receiver_id === $userId && !$msg->is_read) {
                if (isset($conversations[$otherId])) {
                    $conversations[$otherId]['unread_count']++;
                }
            }
        }

        return response()->json([
            'success' => true,
            'data'    => array_values($conversations),
        ]);
    }

}
