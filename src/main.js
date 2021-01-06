import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'
import VueCookies from 'vue-cookies'

import axios from 'axios'
import Vuex from 'vuex'


import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"

import '@/assets/styles/styles.css'
import '@/assets/styles/Footer-Basic.css'


Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(Vuex)
Vue.use(VueCookies)

Vue.prototype.$axios = axios
Vue.config.productionTip = false
Vue.$cookies.config('7d')


new Vue({
    data: {
        api_address: 'py-chain.ddns.net',
        api_port: '55397',
        app_state: 'Test',
        api_combined_address: "http://py-chain.ddns.net:55397/api",
        bitcoin_abuse_token: "wZe9GYRta5RN8s32QOKDmtmMBWkDXzi68ho5LXz4WmmBgstS3sOgRv44rnLZ",
        coindesk_root_url: "https://api.coindesk.com/v1/bpi"
    },
    router,
    render: h => h(App),
}).$mount('#app')

axios.defaults.headers.post['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43'


