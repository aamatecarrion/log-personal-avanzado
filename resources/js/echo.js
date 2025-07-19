import Pusher from 'pusher-js';
window.Pusher = Pusher;

import Echo from 'laravel-echo';

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: 30600,         // el puerto expuesto al exterior
    wssPort: 30600,
    forceTLS: true,
    enabledTransports: ['ws','wss'],
    authEndpoint: '/broadcasting/auth',
    wsPath: '/app-reverb', // misma ruta que en Apache
});
