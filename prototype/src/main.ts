import './assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// FontAwesome setup
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import App from './App.vue'
import router from './router'

// Add FontAwesome icons to library
library.add(fas)

const app = createApp(App)

// Register FontAwesome component globally
app.component('FontAwesomeIcon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)

app.mount('#app')
