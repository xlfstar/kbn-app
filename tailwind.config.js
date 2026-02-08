export default {
  darkMode: ['class', '[data-theme="dark"]'], // ✅ 关键配置
  content: [
    './index.html', // 主 HTML
    './src/**/*.{js,ts,jsx,tsx,vue}', // 所有源文件
    './src/renderer/**/*.{html,js,ts,jsx,tsx,vue}' // 渲染进程文件
  ]
}
