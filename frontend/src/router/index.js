import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import ItemListView from '@/views/ItemListView.vue'
import CategoryUnitManagement from '@/views/CategoryUnitManagement.vue'
import JobListView from '@/views/JobListView.vue'
import JobDetailView from '@/views/JobDetailView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import CheckinView from '@/views/CheckinView.vue'
import JobSummaryView from '@/views/JobSummaryView.vue'
import LogsView from '@/views/LogsView.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'items', name: 'items', component: ItemListView },
      { path: 'category-unit-management', name: 'category-unit-management', component: CategoryUnitManagement },
      { path: 'jobs', name: 'jobs', component: JobListView },
      { path: 'jobs/:id', name: 'JobDetailView', component: JobDetailView },
      {
        path: '/jobs/:id/checkout',
        name: 'CheckoutView',
        component: CheckoutView,

      },
      {
        path: '/jobs/:id/checkin',
        name: 'CheckinView',
        component: CheckinView,
      },
      {
        path: '/jobs/:id/summary',
        name: 'JobSummary',
        component: JobSummaryView,
      },
      {
        path: '/logs',
        name: 'logs',
        component: LogsView,
      },
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

  if (!token && !isAuthPage) {
    return next({ name: 'auth' });
  }

  if (token && isAuthPage) {
    return next({ name: 'home' });
  }

  next();
});

export default router
