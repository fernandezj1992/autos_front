import { createRouter, createWebHistory } from 'vue-router'
import AutosList from '../views/AutosList.vue'
import AutoForm from '../views/AutoForm.vue'
import ReparacionesList from '../views/ReparacionesList.vue'
import ReparacionForm from '../views/ReparacionForm.vue'

const routes = [
  { path: '/', component: AutosList },
  { path: '/agregar', component: AutoForm },
  { path: '/editar/:id', component: AutoForm },
  { path: '/autos/:id/reparaciones', component: ReparacionesList },
  { path: '/autos/:id/reparaciones/agregar', component: ReparacionForm }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
