import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
    // site: 'https://files2.rockhosting.org',
    prefetch: false,
    integrations: [tailwind({
        applyBaseStyles: false
    }), react(),],
    output: 'server',
    adapter: node({
        mode: "standalone"

    }),
    server: {
        port: 4321,
        host: true,
    },
    vite: {
        build: {
            rollupOptions: {
                external: ['sharp']
            }
        }
    },
});