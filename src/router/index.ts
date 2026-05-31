import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import WatchlistView from '../views/WatchlistView.vue'
import RankingView from '../views/RankingView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/watchlist' },
    { path: '/watchlist', name: 'watchlist', component: WatchlistView, meta: { requiresAuth: true } },
    { path: '/ranking',   name: 'ranking',   component: RankingView,   meta: { requiresAuth: true } },
    { path: '/login',     name: 'login',     component: LoginView },
    { path: '/:pathMatch(.*)*', redirect: '/watchlist' },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true
  if (to.query.uid) return true  // public share link, no auth needed
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { name: 'login' }
  return true
})

export default router
