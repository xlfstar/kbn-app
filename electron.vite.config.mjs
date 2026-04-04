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
  main: {
    build: {
      rollupOptions: {
        external: []
      }
    }
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    // 添加 optimizeDeps 配置
    optimizeDeps: {
      include: ['motion-v'] // 确保 motion-v 被预构建
    },
    // 添加 ssr 配置（虽然 renderer 不是 SSR，但有时需要）
    ssr: {
      noExternal: ['motion-v'] // 强制打包 motion-v
    },
    // 添加构建配置
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'motion-v': ['motion-v'] // 将 motion-v 单独打包
          }
        }
      }
    },
    plugins: [vue(), vueJsx(), tailwindcss()]
  }
})
