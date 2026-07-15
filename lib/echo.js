import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Setup window.Pusher
if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

const createEcho = (token) => {
  if (typeof window === 'undefined') return null;
  
  return new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'reverb-key',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || '127.0.0.1',
    wsPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
    wssPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'https://backend.ekonseling.smkn1pontianak.sch.id'}/api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

export default createEcho;
