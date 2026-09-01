import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/core/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/',
      name: 'routes',
      component: () => import('@/views/RoutesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/routes/:id',
      name: 'route-detail',
      component: () => import('@/views/RouteDetailView.vue'),
      meta: { requiresAuth: true },
      props: true,
    },
    {
      path: '/drones',
      name: 'drones',
      component: () => import('@/views/DronesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/sites',
      name: 'sites',
      component: () => import('@/views/SitesView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
