import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import LoginForm from '@/views/LoginForm.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: LoginForm,
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

