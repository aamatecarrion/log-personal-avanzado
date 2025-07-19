import Pusher from 'pusher-js';
window.Pusher = Pusher;

import Echo from 'laravel-echo';

window.Echo = new Echo({
    broadcaster: 'reverb',
    client: new Pusher(import.meta.env.VITE_REVERB_APP_KEY, {
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: 443,
        wssPort: 443,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
        authEndpoint: '/broadcasting/auth',
        // 🔥 ESTA ES LA CLAVE
        // añade el path manualmente en el `wsPath`
        wsPath: '/app-reverb',
    }),
});
