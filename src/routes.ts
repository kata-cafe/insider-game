import type { RouteRecordRaw } from 'vue-router'
import Home from './pages/Home.vue'
import { isRoomLeader, peerConn } from './peer'

function peerConnGuard() {
  if (!isRoomLeader.value && !peerConn.value)
    return { name: 'home' }
}

export const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/game-room',
    name: 'game-room',
    beforeEnter: [peerConnGuard],
    component: () => import('./pages/GameRoom.vue'),
  },
  {
    path: '/in-game',
    name: 'in-game',
    beforeEnter: [peerConnGuard],
    component: () => import('./pages/InGame.vue'),
  },
]
