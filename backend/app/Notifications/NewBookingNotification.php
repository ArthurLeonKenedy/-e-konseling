<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class NewBookingNotification extends Notification
{
    use Queueable;

    protected $booking;

    public function __construct($booking)
    {
        $this->booking = $booking;
    }

    public function via($notifiable)
    {
        return [WebPushChannel::class, 'database'];
    }

    public function toWebPush($notifiable, $notification)
    {
        $siswaName = $this->booking->siswa->name ?? 'Siswa';
        $kelas = $this->booking->siswa->kelas ?? '';
        $topik = $this->booking->topik ?? 'Bimbingan Konseling';
        $tanggal = $this->booking->tanggal;
        $waktu = $this->booking->waktu;

        return (new WebPushMessage)
            ->title('Pengajuan Konseling Baru: ' . $siswaName)
            ->icon('/logo-smkn1.jpg')
            ->body("Siswa {$siswaName} ({$kelas}) mengajukan konseling pada {$tanggal} pukul {$waktu}. Topik: {$topik}")
            ->action('Buka Antrean', 'notification_action')
            ->data(['url' => '/guru']);
    }

    public function toArray($notifiable)
    {
        $siswaName = $this->booking->siswa->name ?? 'Siswa';
        $kelas = $this->booking->siswa->kelas ?? '';
        return [
            'title' => 'Pengajuan Konseling Baru',
            'body' => "Siswa {$siswaName} ({$kelas}) mengajukan konseling.",
            'url' => '/guru'
        ];
    }
}
