import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: ['favicon.png', 'robots.txt'],
            manifest: {
                name: 'Log Personal Avanzado',
                short_name: 'Log Personal',
                description: 'Una aplicación para registrar cosas',
                theme_color: '#ffffff',
                icons: [
                {
                    src: '/favicon.png',
                    sizes: '512x512',
                    type: 'image/png',
                },
                ],
            },
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    server: {
        host: true,
        watch: {
            ignored: ['**/storage/clockwork/**']
        }
    }
});
