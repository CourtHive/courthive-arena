import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  // Relative asset paths so the build works from /arena/ subdirectory
  // when served by the factory server's static file handler.
  base: './',
  server: {
    port: 5180,
    // Bind to all interfaces so other devices on the LAN can access
    host: '0.0.0.0',
    open: true,
  },
  preview: {
    port: 5180,
    host: '0.0.0.0',
  },
});
