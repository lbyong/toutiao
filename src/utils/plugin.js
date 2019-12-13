// 注册插件

// 引入dayjs时间格式转换
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn' // 引入dayjs语言包，通过locale()进行设置
dayjs.extend(relativeTime)

const sleep = () => {
  // 通过延时定时器每过1秒返回一次成功的异步请求
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 1000)
  })
}

// 注册全局过滤器
const relTime = (value) => {
  // 对日期对象进行转换
  return dayjs().locale('zh-cn').from(value)
}

export default {
  install (Vue) {
    Vue.prototype.$sleep = sleep
    // 全局过滤器处理时间
    Vue.filter('relTime', relTime)
  }
}
