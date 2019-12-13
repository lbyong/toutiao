// 封装axios, 导出一个可以直接调用的接口函数
// 导入axios
import axios from 'axios'
import JSONBIGINT from 'json-bigint'
import store from '@/store'
import router from '@/router'

// 1 js最大安全数字处理
// 2 在头部设置token
// 3 响应结束 获取有效data
// 4 token失效刷新token

// 创建一个新的axios实例，区别原始实例对象axios()
const instance = axios.create({
  // 配置公共地址
  baseURL: 'http://ttapi.research.itcast.cn/',
  // 1 大数字格式转换处理
  transformResponse: [data => {
    // 判断data是否存在并且返回data数据
    try {
      return JSONBIGINT.parse(data)
    } catch (e) {
      return data
    }
  }]
})

// 新实例instance配置请求拦截器
instance.interceptors.request.use(config => {
  // 2 修改配置，头部设置token
  // 判读vuex中的token是否存在，存在配置到请求头
  if (store.state.user.token) {
    config.headers.Authorization = `Bearer ${store.state.user.token}`
  }
  return config
}, err => {
  // axios发生错误的处理
  return Promise.reject(err)
})

// 新实例instance配置响应拦截器
instance.interceptors.response.use(res => {
  // 3 响应结束 获取有效data
  // 存在获取直接获取data，不存在返回这个不存的数据
  try {
    return res.data.data
  } catch (err) {
    return res
  }
}, async err => {
  // 设置在login页面的url中设置redirectUrl = 当前路由地址
  // router.currentRoute 模块中的当前路由对象
  // $route 组件中的当前路由对象
  const loginConfig = { path: '/login', query: { redirectUrl: router.currentRoute.path } }
  // 如果refresh_token不存在用try-catch进行配置
  try {
    // error.response  响应对象   error.config请求配置
    // 4 刷新token，判断错误信息存在并且报401错误
    if (err.response || err.response.status === 401) {
      // 未登录跳转页面
      // console.log(error)
      const { user } = store.state // 取出在vuex中保存的token
      if (!user.token || user.refresh_token) {
        // token不存在跳转登录页面并终止程序运行
        router.push(loginConfig)
        return Promise.reject(err)
      }
      // 使用没有配置请求头的axios刷新token发送请求
      const res = await axios({
        url: 'http://ttapi.research.itcast.cn/app/v1_0/authorizations',
        method: 'put',
        // 在请求头部添加refresh_token
        headers: {
          Authorization: `Bearer ${user.refresh_token}`
        }
      })
      // 更新vuex和本地的token，获取到vuex中的存储的setUser方法重新设置token，继续保留user中的默认refresh_token
      store.commit('setUser', {
        token: res.data.data.token,
        refresh_token: user.refresh_token
      })
      // 继续发送刚才错误请求，传入请求配置相关参数config
      return instance(err.config)
      // console.log(error)
    }
  } catch (e) { // exception
    // refresh_token不存在跳转登录页面并终止程序运行
    router.push(loginConfig)
    return Promise.reject(e)
  }
  // axios发生错误的处理，返回的一个错误的Promise对象
  return Promise.reject(err)
})

// 5 导出axios请求接口函数
export default (url, method, data) => {
  // 使用配置好的axios实例instance来发送请求，并返回一个Promise对象获取数据
  return instance({
    url,
    method,
    // 根据请求方式来确定data的传参方式
    // js基础对象获取属性的两种方式 ：obj.data   obj[变量 | js表达式]
    // 判断请求方式大小写  get   GET
    [method.toLowerCase() === 'get' ? 'params' : 'data']: data
  })
}
