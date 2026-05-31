import { createRouter, createWebHistory } from 'vue-router'
import WatchlistView from '../views/WatchlistView.vue'
import RankingView from '../views/RankingView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/watchlist' },
    { path: '/watchlist', name: 'watchlist', component: WatchlistView },
    { path: '/ranking', name: 'ranking', component: RankingView },
    { path: '/:pathMatch(.*)*', redirect: '/watchlist' },
  ],
})
