import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Lenis from 'lenis'
import './style.scss'
import App from './App.vue'
import router from './router'

const lenis = new Lenis({ autoRaf: true })
// expose so devtools can reach it if needed
;(window as unknown as Record<string, unknown>)['lenis'] = lenis

createApp(App)
  .use(router)
  .use(PrimeVue, { unstyled: true })
  .mount('#app')
