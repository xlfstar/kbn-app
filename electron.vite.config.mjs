import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
export default defineConfig({
  define: {
    __dirname: `JSON.stringify(${JSON.stringify(__dirname)})`,
    __filename: `JSON.stringify(${JSON.stringify(__filename)})`
  },
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },

    plugins: [vue(), vueJsx(), tailwindcss()]
  }
})
