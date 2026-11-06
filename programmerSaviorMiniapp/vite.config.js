import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    // 允许同一局域网内的手机访问（真机测试用）
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  }
})
