import './assets/main.css'
import './theme/index.scss'
import { createApp } from 'vue'
import i18n from './locales'
import pinia from './stores'
import App from './App.vue'
import router from './router'
const app = createApp(App)

app.use(i18n)
app.use(pinia)
app.use(router)
app.mount('#app')
