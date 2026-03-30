import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '../pages/DashboardPage.vue'
import TicketsPage from '../pages/TicketsPage.vue'
import ReportsPage from '../pages/ReportsPage.vue'
import ModulesPage from '../pages/ModulesPage.vue'

const routes = [
  { path: '/', component: DashboardPage },
  { path: '/tickets', component: TicketsPage },
  { path: '/reports', component: ReportsPage },
  { path: '/modules', component: ModulesPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router