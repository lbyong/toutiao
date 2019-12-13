import Vue from 'vue'
import Vuex from 'vuex'

// 导入用户认证模块
import * as auth from '@/utils/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用户认证信息(token, refresh_token)
    user: auth.getUser(),
    photo: null // 用户头像
  },
  mutations: {
    // 修改用户头像
    setPhoto (state, photo) {
      state.photo = photo
    },
    // 修改用户认证信息
    setUser (state, user) {
      state.user = user
      // 重新设置本地数据
      auth.setUser(user)
    },
    // 清除数据
    delUser (state) {
      state.user = {} // 删除state中的数据
      auth.delUser() // 删除本地存储的数据
    }
  },
  actions: {
  },
  modules: {
  }
})
