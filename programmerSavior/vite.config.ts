import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Vite 配置：
 * - react 提供 JSX 转换和开发时的 Fast Refresh。
 * - tailwindcss 扫描源码中的 className，并按需生成样式。
 * - /api 代理到本地 Spring Boot，避免开发环境出现跨域 Cookie 问题。
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        // 把真实客户端 IP 传给后端，用于生成匿名评论昵称
        xfwd: true,
      },
    },
  },
})
