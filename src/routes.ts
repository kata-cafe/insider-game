import type { RouteRecordRaw } from 'vue-router'
import Home from './pages/Home.vue'
import { isRoomLeader, roomLeaderConn } from './store'

function peerConnGuard() {
  if (!isRoomLeader.value && !roomLeaderConn.value)
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
  {
    path: '/vote-room',
    name: 'vote-room',
    beforeEnter: [peerConnGuard],
    component: () => import('./pages/VoteRoom.vue'),
  },
  {
    path: '/game-result',
    name: 'game-result',
    beforeEnter: [peerConnGuard],
    component: () => import('./pages/GameResult.vue'),
  },
]
