import Pusher from 'pusher-js';
window.Pusher = Pusher;

import Echo from 'laravel-echo';

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'wss',
    enabledTransports: ['ws','wss'],
    authEndpoint: '/broadcasting/auth',
    wsPath: import.meta.env.VITE_REVERB_PATH, // misma ruta que en Apache
});
