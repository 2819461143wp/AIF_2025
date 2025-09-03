import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/Admin.vue'),
      children: [
        {
          path: 'system/analysis',
          name: 'systemAnalysis',
          component: () => import('@/views/admin/SystemAnalysis.vue'),
        },
        {
          path: 'system/role',
          name: 'systemRole',
          component: () => import('@/views/admin/SystemRole.vue'),
        },
        {
          path: 'user/insert',
          name: 'userInsert',
          component: () => import('@/views/admin/UserInsert.vue'),
        },
        {
          path: 'user/update',
          name: 'userUpdate',
          component: () => import('@/views/admin/UserUpdate.vue'),
        },
        {
          path: 'model/data',
          name: 'adminData',
          component: () => import('@/views/admin/DataUpload.vue'),
        },
        {
          path: 'model/train',
          name: 'modelTrain',
          component: () => import('@/views/admin/ModelTrain.vue'),
        },
        {
          path: 'model/predict',
          name: 'modelPredict',
          component: () => import('@/views/admin/ModelPredict.vue'),
        },
        {
          path: 'model/advice',
          name: 'modelAdvice',
          component: () => import('@/views/admin/ModelAdvice.vue'),
        },
        {
          path: 'equip/order',
          name: 'equipOrder',
          component: () => import('@/views/admin/EquipOrder.vue'),
        },
        {
          path: 'equip/process',
          name: 'equipProcess',
          component: () => import('@/views/admin/EquipProcess.vue'),
        },
        {
          path: 'equip/list',
          name: 'equipList',
          component: () => import('@/views/admin/EquipList.vue'),
        },
      ],
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
  ],
})

export default router
