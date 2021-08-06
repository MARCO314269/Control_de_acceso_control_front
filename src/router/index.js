import Vue from 'vue'
import Router from 'vue-router'

import Control from '@/components/Control'
Vue.use(Router)


export default new Router({
  routes: [
    {
      path: '/control',
      name: 'Control',
      component: Control
    },
  ],
  mode: 'history'
})
