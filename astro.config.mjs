import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import node from "@astrojs/node";

import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind({
    applyBaseStyles: false
  }), react(), db()],
  output: 'server',
  adapter: node({
    mode: "standalone"
  }),
  vite: {
    build: {
      rollupOptions: {
        external: ['sharp']
      }
    }
  },
});