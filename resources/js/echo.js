import Pusher from 'pusher-js';
window.Pusher = Pusher; // 👈 esto es imprescindible para Reverb

import Echo from 'laravel-echo';

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    wsPath: '/app-reverb',
});
