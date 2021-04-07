import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../components/Home.vue')
    },
    {
        path: '/BlockExplorer',
        name: 'Block Explorer',
        component: () => import('../components/BlockExplorer.vue'),
        meta:{title: "Block Explorer"}
    },
    {
        path: '/AddressExplorer',
        name: 'Address Explorer',
        component: () => import('../components/AddressExplorer.vue')
    },
    {
        path: '/Settings',
        name: 'Settings',
        component: () => import('../components/Settings.vue')
    },
    {
        path: '/SavedSearches',
        name: 'Saved Searches',
        component: () => import('../components/Unused/SavedSearches.vue')
    },
    {
        path: '/Visualiser',
        name: 'Visualiser',
        component: () => import('../components/Unused/Visualiser.vue')
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
