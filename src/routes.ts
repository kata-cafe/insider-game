import type { RouteRecordRaw } from 'vue-router'
import Home from './pages/Home.vue'

export const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/game-room',
    name: 'game-room',
    component: () => import('./pages/GameRoom.vue'),
  },
]
