import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const SITE_NAME = 'Eni Carter'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView, meta: { title: 'Eni Carter – Tetoválóművész' } },
    { path: '/blog', component: () => import('../views/BlogView.vue'), meta: { title: 'Blog' } },
    { path: '/blog/:slug', component: () => import('../views/BlogPostView.vue'), meta: { title: 'Blog' } },
    { path: '/admin', component: () => import('../views/AdminView.vue'), meta: { title: 'Admin' } },
    { path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue'), meta: { title: 'Oldal nem található' } },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

// Keep the document title in sync with the active route. Home uses the full
// title as-is; other routes are suffixed with the site name. BlogPostView
// overrides this with the post title once it loads.
router.afterEach((to) => {
  const title = (to.meta.title as string) || SITE_NAME
  document.title = to.path === '/' ? title : `${title} – ${SITE_NAME}`
})

export default router
