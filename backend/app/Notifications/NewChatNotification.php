<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class NewChatNotification extends Notification
{
    use Queueable;

    protected $messageData;

    public function __construct($messageData)
    {
        $this->messageData = $messageData;
    }

    public function via($notifiable)
    {
        return [WebPushChannel::class, 'database'];
    }

    public function toWebPush($notifiable, $notification)
    {
        $senderName = $this->messageData['senderName'] ?? 'Pengguna';
        $senderId = $this->messageData['senderId'] ?? '';
        $senderRole = $this->messageData['senderRole'] ?? 'siswa';
        $chatUrl = '/chat?targetId=' . $senderId
            . '&targetName=' . urlencode($senderName)
            . '&targetRole=' . $senderRole;

        return (new WebPushMessage)
            ->title('Pesan Baru dari ' . $senderName)
            ->icon('/logo-smkn1.jpg')
            ->body($this->messageData['text'] ?? 'Seseorang mengirimkan pesan bimbingan baru.')
            ->action('Buka Chat', 'notification_action')
            ->data(['url' => $chatUrl]);
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'Pesan Baru dari ' . ($this->messageData['senderName'] ?? 'Siswa'),
            'body' => $this->messageData['text'] ?? 'Seseorang mengirimkan pesan bimbingan baru.',
            'url' => '/guru'
        ];
    }
}
