import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
    ],
    server: {
        host: '0.0.0.0', // 监听所有网络接口
        port: 5173,      // 默认端口，可自定义
        open: true       // 可选：自动打开浏览器
    }
})
