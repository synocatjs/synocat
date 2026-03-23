import { defineConfig } from 'vite';
import vue2 from '@vitejs/plugin-vue2';
import path from 'path';

export default defineConfig({
  plugins: [vue2()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vue': 'vue/dist/vue.esm.js'
    },
    extensions: ['.js', '.vue', '.json']
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  server: {
    port: 8080,
    open: true,
    host: true,
    hmr: true
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'SykitUI',
      fileName: (format) => `sykit-ui.${format}.js`,
      formats: ['umd', 'es']
    },
    rollupOptions: {
      external: ['vue', 'element-ui'],
      output: {
        globals: {
          vue: 'Vue',
          'element-ui': 'ElementUI'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'sykit-ui.css';
          return assetInfo.name;
        }
      }
    },
    sourcemap: true
  },
  optimizeDeps: {
    include: ['vue', 'element-ui']
  }
});