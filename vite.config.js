import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const SCSS_PARTIALS = ['_variables.scss', '_mixins.scss', '_base.scss', 'index.scss'];

const variablesPath = path.resolve(__dirname, 'src/styles/_variables.scss').replace(/\\/g, '/');
const mixinsPath    = path.resolve(__dirname, 'src/styles/_mixins.scss').replace(/\\/g, '/');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Auto-inject variables + mixins into every component SCSS module.
        // Skips the partials themselves to avoid circular @use errors.
        additionalData: (content, filepath) => {
          const isPartial = SCSS_PARTIALS.some((name) => filepath.endsWith(name));
          if (isPartial) return content;
          return `@use "${variablesPath}" as *;\n@use "${mixinsPath}" as *;\n${content}`;
        },
      },
    },
  },
});
