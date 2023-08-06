import type { RouteRecordRaw } from 'vue-router'
import Home from './pages/Home.vue'
import { isRoomLeader, peerConn } from './peer'

export const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/game-room',
    name: 'game-room',
    beforeEnter() {
      if (!isRoomLeader.value && !peerConn.value)
        return { name: 'home' }
    },
    component: () => import('./pages/GameRoom.vue'),
  },
]
