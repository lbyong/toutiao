import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入vant模块
import Vant, { Lazyload } from 'vant'
// import 'vant/lib/index.css'
import 'vant/lib/index.less' // 修改vant主题引入样式
import 'amfe-flexible' // 根据屏幕大小动态设置基准值

// 引入全局样式
import '@/styles/index.less'

// 引入插件
import Plugin from '@/utils/plugin'
Vue.use(Plugin)

Vue.use(Vant)
Vue.use(Lazyload)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
