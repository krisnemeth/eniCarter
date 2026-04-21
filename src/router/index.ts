import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/blog', component: () => import('../views/BlogView.vue') },
    { path: '/blog/:slug', component: () => import('../views/BlogPostView.vue') },
    { path: '/admin', component: () => import('../views/AdminView.vue') },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

export default router
