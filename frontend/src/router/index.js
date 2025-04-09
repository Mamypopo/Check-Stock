import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import AuthView from '../views/AuthView.vue'
import ItemListView from '@/views/ItemListView.vue'
import CategoryUnitManagement from '@/views/CategoryUnitManagement.vue'
import JobListView from '@/views/JobListView.vue'
import JobDetailView from '@/views/JobDetailView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import CheckinView from '@/views/CheckinView.vue'
import JobSummaryView from '@/views/JobSummaryView.vue'
import LogsView from '@/views/LogsView.vue'
import TemplateManagementView from '../views/TemplateManagementView.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: 'items', name: 'items', component: ItemListView, meta: { requiresAuth: true } },
      { path: 'category-unit-management', name: 'category-unit-management', component: CategoryUnitManagement, meta: { requiresAuth: true } },
      { path: 'jobs', name: 'jobs', component: JobListView, meta: { requiresAuth: true } },
      { path: 'jobs/:id', name: 'JobDetailView', component: JobDetailView, meta: { requiresAuth: true } },
      { path: '/jobs/:id/checkout', name: 'CheckoutView', component: CheckoutView, meta: { requiresAuth: true } },
      { path: '/jobs/:id/checkin', name: 'CheckinView', component: CheckinView, meta: { requiresAuth: true } },
      { path: '/jobs/:id/summary', name: 'JobSummary', component: JobSummaryView, meta: { requiresAuth: true } },
      { path: '/logs', name: 'logs', component: LogsView, meta: { requiresAuth: true } },
      { path: '/templates', name: 'templates', component: TemplateManagementView, meta: { requiresAuth: true } },
    ]
  },
  {
    path: '/',
    component: AuthLayout,
    children: [
      { path: 'auth', name: 'auth', component: AuthView }
    ]
  },
  {
    path: '/auth/oauth-callback',
    name: 'OAuthCallback',
    component: () => import('../views/AuthView.vue')
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isAuthPage = to.name === 'auth';
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !token) {
    return next({ name: 'auth' });
  }

  if (!token && !isAuthPage) {
    return next({ name: 'auth' });
  }

  if (token && isAuthPage) {
    return next({ name: 'home' });
  }

  next();
});

export default router
