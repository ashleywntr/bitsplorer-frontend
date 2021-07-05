import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'
import VueCookies from 'vue-cookies'

import axios from 'axios'
import Vuex from 'vuex'


import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"

import '@/assets/styles/override_style.css'
import '@/assets/styles/Footer-Basic.css'


Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(Vuex)
Vue.use(VueCookies)

Vue.prototype.$axios = axios
Vue.config.productionTip = false
Vue.$cookies.config('7d')

let api_address = 'bitsplorer.ddns.net'
let api_port = '55397'

let brand_text = "Bitsplorer"
let brand_stylised = "₿ITSPLOR£R"
let brand_cobmbined = `${" | "+brand_stylised}`

new Vue({
    data: {
        app_state: 'Dev',
        api_combined_address: `http://${api_address}:${api_port}/api`,
        coindesk_root_url: "https://api.coindesk.com/v1/bpi",
        api_port: api_port,
        api_address: api_address,
        title_brand: brand_cobmbined,
        brand_text: brand_text
    },
    router,
    render: h => h(App),
}).$mount('#app')

axios.defaults.headers.post['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43'


